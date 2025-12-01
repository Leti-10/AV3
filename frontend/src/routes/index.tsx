import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../Components/Layout';
import Login from '../Pages/Login';
import Dashboard from '../Pages/Dashboard';
import ListarAero from '../Pages/ListarAero';
import DetalhesAero from '../Pages/DetalhesAero';
import Pecas from '../Pages/Pecas';
import Testes from '../Pages/Testes';
import Func from '../Pages/Func';
import Relatorios from '../Pages/Relatorios';
import Etapas from '../Pages/Etapas';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <Layout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'aeronaves',
        element: <ListarAero />,
      },
      {
        path: 'aeronaves/:id',
        element: <DetalhesAero />,
      },
      {
        path: 'pecas',
        element: <Pecas />,
      },
      {
        path: 'etapas',
        element: <Etapas />,
      },
      {
        path: 'testes',
        element: <Testes />,
      },
      {
        path: 'funcionarios',
        element: <Func />,
      },
      {
        path: 'relatorios',
        element: <Relatorios />,
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}