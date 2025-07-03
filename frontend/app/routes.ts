import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('./routes/home.tsx'),
    route('/user/:address', './routes/view.tsx'),
    route('/user/listings/:address', './routes/view/listings.tsx'),
    route('/list/:contract/:tokenId', './routes/list.tsx'),
    route('/token/:contract/:tokenId', './routes/view/token.tsx'),
] satisfies RouteConfig;
