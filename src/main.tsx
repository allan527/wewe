import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles.css';
import { Toaster } from 'sonner';
import { AppRoot, AppRouterViews } from './App';

const router = createBrowserRouter([
  {
    element: <AppRoot />,
    children: [
      { path: '/login', element: <AppRouterViews.Login /> },
      {
        element: <AppRouterViews.Layout />,
        children: [
          { path: '/', element: <AppRouterViews.Dashboard /> },
          { path: '/clients', element: <AppRouterViews.Clients /> },
          { path: '/clients/:id', element: <AppRouterViews.ClientDetail /> },
          { path: '/loans', element: <AppRouterViews.Loans /> },
          { path: '/transactions', element: <AppRouterViews.Transactions /> },
          { path: '/cashbook', element: <AppRouterViews.Cashbook /> },
          { path: '/owner-capital', element: <AppRouterViews.OwnerCapital /> },
          { path: '/evaluation', element: <AppRouterViews.Evaluation /> },
          { path: '/data-view', element: <AppRouterViews.DataView /> },
          { path: '/client-allocation', element: <AppRouterViews.ClientAllocation /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Toaster richColors position="top-right" />
    <RouterProvider router={router} />
  </React.StrictMode>,
);
