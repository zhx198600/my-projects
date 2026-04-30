import { type ComponentType, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const requireAdmin = <P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> => {
  const WithAdminAuth: ComponentType<P> = (props: P) => {
    const navigate = useNavigate();

    useEffect(() => {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        navigate('/admin/login');
      }
    }, [navigate]);

    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithAdminAuth.displayName = `WithAdminAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithAdminAuth;
};

export default requireAdmin;
