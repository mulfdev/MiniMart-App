import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
    index('./routes/home.tsx'),
    route('/user/:address', './routes/user/view.tsx'),
    route('/user/listings/:address', './routes/user/listings.tsx'),
    route('/user/listings/:address/completed', './routes/user/completedOrders.tsx'),
    route('/list/:contract/:tokenId', './routes/list.tsx'),
    route('/token/:contract/:tokenId', './routes/token.tsx'),
    route('orders', './routes/allOrders.tsx'),
] satisfies RouteConfig;
