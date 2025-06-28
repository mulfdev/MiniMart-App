import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('./routes/home.tsx'),
    route('/view/:address', './routes/view.tsx'),
    route('/list/:contract/:tokenId', './routes/list.tsx'),
    route('/view/token/:contract/:tokenId', './routes/view/token.tsx'),
] satisfies RouteConfig;
