import React from 'react';
import { Navigate } from 'react-router-dom';

// /auth → redirect to /auth/signin
const AuthPage: React.FC = () => <Navigate to="/auth/signin" replace />;

export default AuthPage;
