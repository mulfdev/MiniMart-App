import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('./routes/home.tsx'),
    route('/view/:address', './routes/view.tsx'),
] satisfies RouteConfig;
