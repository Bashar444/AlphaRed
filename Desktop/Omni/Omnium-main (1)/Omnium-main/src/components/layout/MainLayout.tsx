
import React from 'react';
import { Navigation } from './Navigation';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children }: { children?: React.ReactNode }) => {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<div className="flex">
				<Sidebar />
				<main className="flex-1 p-6 ml-64">
					{children}
				</main>
			</div>
		</div>
	);
};
