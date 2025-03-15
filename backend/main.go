package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/url"
	"os"

	"github.com/duke-git/lancet/v2/cryptor"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/pkg/errors"
)

func main() {
	app := fiber.New(fiber.Config{EnablePrintRoutes: true, ErrorHandler: fiber.DefaultErrorHandler})

	app.Use(requestid.New())

	api := app.Group("/api")
	api.Post("/upload", Upload)
	api.Get("/download/:id", Download)
	// api.Head("/download/:id", Download)

	log.Fatal(app.Listen(fmt.Sprintf(":%v", 8080)))
}

func Upload(c *fiber.Ctx) error {
	// extracting `Content-Range` from request header
	contentRange := c.Get("Content-Range")
	fmt.Printf("%#v\n", contentRange)

	formData, err := c.MultipartForm()
	if err != nil {
		return errors.WithStack(err)
	}
	fmt.Printf("%#v\n", formData)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return errors.WithStack(err)
	}
	fmt.Printf("%#v\n", fileHeader)

	f, _ := fileHeader.Open()
	defer f.Close()
	bytes, _ := io.ReadAll(f)
	// 将字节数据追加写入指定文件

	file, err := os.OpenFile("replace-with-your-file-path", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatalf("failed to open the file: %v", err)
	}
	defer file.Close()

	// 写入数据
	_, err = file.Write(bytes)
	if err != nil {
		log.Fatalf("failed to write to the file: %v", err)
	}

	return c.SendStatus(fiber.StatusOK)
}

func Download(c *fiber.Ctx) error {
	const filename = "d:\\test.pptx"
	f, err := os.Open(filename)
	if err != nil {
		return errors.WithStack(err)
	}

	defer f.Close()

	fileinfo, _ := f.Stat()

	rangeData, err := c.Range(int(fileinfo.Size()))
	if err != nil {
		return errors.WithStack(err)
	}
	// TODO disallow multirange request
	if _, err := f.Seek(int64(rangeData.Ranges[0].Start), 0); err != nil {
		return errors.WithStack(err)
	}

	start := rangeData.Ranges[0].Start
	end := rangeData.Ranges[0].End
	length := end - start + 1
	fmt.Println(start, end, fileinfo.Size())
	// TODO check chunk size

	b := make([]byte, length)
	if _, err := f.Read(b); err != nil {
		return errors.WithStack(err)
	}

	// TODO You should read the md5 value from database where the file metadata stored, rather than calculating it every time you download the file.
	hash, _ := cryptor.Md5File(filename)

	c.Response().Header.Add("x-file-hash", hash)
	c.Response().Header.Add("Accept-Ranges", "bytes")
	c.Response().Header.Add("Content-Type", "application/octet-stream")
	c.Response().Header.Add("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, url.QueryEscape(fileinfo.Name())))
	c.Response().Header.Add("Content-Range", fmt.Sprintf("bytes %v-%v/%v", start, end, fileinfo.Size()))
	return c.Status(206).SendStream(bytes.NewReader(b), length)
}
