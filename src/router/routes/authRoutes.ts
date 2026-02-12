import type { RouteRecordRaw } from "vue-router";

const Home = () => import("@/views/HomeView.vue").then((m) => m.default || m);

const Login = () =>
    import("@/views/auth/LoginView.vue").then((m) => m.default || m);

// Make sure the file exists at the specified path or update the path accordingly.
// Example: If the correct file is at '@/views/auth/password/Email.vue', update the import as follows:
const Password = () =>
    import("@/views/auth/password/EmailView.vue").then((m) => m.default || m);

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "welcome",
        component: Home,
        redirect: { name: "home" },
        meta: {
            title: "Dashboard",
            middleware: "auth",
        },
        children: [],
    },
    {
        path: "/home",
        name: "home",
        component: Home,
        meta: {
            middleware: "auth",
        },
    },
    {
        path: "/login",
        name: "login",
        component: Login,
        meta: {
            layout: "auth",
            middleware: "guest",
        },
    },
    {
        path: "/password/request",
        name: "password.request",
        component: Password,
        meta: {
            layout: "auth",
            middleware: "guest",
        },
    }
];

export default routes;
