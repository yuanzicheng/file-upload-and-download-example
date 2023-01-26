import './App.less';
import { Router } from 'pages/router';
import { AuthProvider } from 'context/auth';
import { UseFetchProvider } from 'context/fetch';

function App() {
  return (
    <>
      <UseFetchProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </UseFetchProvider>
    </>
  );
}

export default App;
