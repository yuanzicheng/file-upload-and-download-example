package main

import (
	"bufio"
	"bytes"
	"fmt"
	"io/fs"
	"log"
	"net/url"
	"os"
	"strconv"

	"github.com/duke-git/lancet/v2/convertor"
	"github.com/duke-git/lancet/v2/cryptor"
	"github.com/duke-git/lancet/v2/slice"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/pkg/errors"
)

func main() {
	app := fiber.New()

	app.Use(requestid.New())

	api := app.Group("/api")
	api.Post("/upload", Upload)
	api.Get("/download/:id", Download)

	log.Fatal(app.Listen(fmt.Sprintf(":%v", 8080)))
}

func Upload(c *fiber.Ctx) error {
	// formData, err := c.MultipartForm()
	// if err != nil {
	// 	return errors.WithStack(err)
	// }
	// fmt.Printf("%+v", formData)

	index, _ := convertor.ToInt(c.FormValue("index"))
	total, _ := convertor.ToInt(c.FormValue("total"))
	name := c.FormValue("name")
	size, _ := convertor.ToInt(c.FormValue("size"))
	hash := c.FormValue("hash")
	chunk, err := c.FormFile("file")
	if err != nil {
		return errors.WithStack(err)
	}

	// Check file chunk size.
	var chunkSize int64 = 1024 * 1024
	if (index < total-1 && chunk.Size != chunkSize) || (index == (total-1) && chunk.Size != (size%chunkSize)) {
		return errors.New("Invalid chunk size.")
	}

	// Create a directory named `hash` is the directory is not exist.
	info, err := os.Stat(hash)
	if (err != nil && os.IsNotExist(err)) || !info.IsDir() {
		if err := os.Mkdir(hash, 0777); err != nil {
			return errors.WithStack(err)
		}
	}

	// TODO Check if this chunk is already uploaded.

	// save file chunk to the directory named `hash`.
	if err := c.SaveFile(chunk, fmt.Sprintf("%v/%v", hash, index)); err != nil {
		return errors.WithStack(err)
	}

	// Check if all files have been uploaded, and complete the uploading, merge all the chunks into one file.
	entries, err := os.ReadDir(hash)
	if len(entries) >= int(total) {
		completed := true
		result := slice.Map(
			slice.Filter(entries, func(_ int, entry fs.DirEntry) bool { return !entry.IsDir() }),
			func(_ int, entry fs.DirEntry) string { return entry.Name() },
		)
		for i := 0; i < int(total-1); i++ {
			if !slice.Contain(result, strconv.Itoa(i)) {
				completed = false
				break
			}
		}
		if completed {
			file, err := os.OpenFile(fmt.Sprintf("%v/%v", hash, name), os.O_CREATE|os.O_RDWR|os.O_APPEND, 0666)
			if err != nil {
				return errors.WithStack(err)
			}
			defer file.Close()
			writer := bufio.NewWriter(file)
			for i := 0; i <= int(total-1); i++ {
				filename := fmt.Sprintf("%v/%v", hash, i)
				bytes, _ := os.ReadFile(filename)
				writer.Write(bytes)
				if err := os.Remove(filename); err != nil {
					log.Println(err)
				}
				index++
			}
			writer.Flush()
		}
	}

	return c.JSON("ok")
}

func Download(c *fiber.Ctx) error {
	const filename = "test.pdf"
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
