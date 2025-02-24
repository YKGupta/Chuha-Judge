import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import store from './redux/Store';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './Root';
import Login from './components/Login';
import Signup from './components/Signup';
import Verify from './components/Verify';
import Problems from './components/Problems';
import UserLoader from './loaders/User';
import ProblemsTable from './components/ProblemsTable';
import ProblemsLoader from './loaders/Problems';
import Problem from './components/Problem';
import ProblemLoader from './loaders/Problem';
import ProblemDescription from './components/ProblemDescription';
import CodeRun from './components/CodeRun';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Provider store={store}><Root /></Provider>,
		children: [
			{
				path: '/login',
				element: <Login />
			},
			{
				path: '/signup',
				element: <Signup />
			},
			{
				path: '/verify',
				element: <Verify />
			},
			{
				path: '/problems',
				element: <Problems />,
				loader: UserLoader,
				children: [
					{
						path: '/problems',
						element: <ProblemsTable />,
						loader: ProblemsLoader
					},
					{
						path: '/problems/:code',
						element: <Problem />,
						loader: ProblemLoader,
						children: [
							{
								path: '/problems/:code',
								element: <ProblemDescription />
							},
							{
								path: '/problems/:code/run',
								element: <CodeRun />
							}
						]
					}
				]
			},
			{
				path: '*',
				element: <p>Error</p>
			}
		]
	}
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
