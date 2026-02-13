import type { RouteRecordRaw } from "vue-router";

const Home = () => import("@/views/HomeView.vue").then((m) => m.default || m);

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
        path: "/users",
        component: () =>
            import("@/views/users/UsersIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "users.index",
                redirect: { name: "users.list" },
            },
            {
                path: "list",
                name: "users.list",
                component: () =>
                    import("@/views/users/UsersList.vue").then((m) => m.default || m),
            }
        ],
    }
    // {
    //     path: "/currencies",
    //     component: () =>
    //         import("@/views/currencies/CurrenciesIndex.vue").then((m) => m.default || m),
    //     children: [
    //         {
    //             path: "",
    //             name: "currencies.index",
    //             redirect: { name: "currencies.list" },
    //         },
    //         {
    //             path: "list",
    //             name: "currencies.list",
    //             component: () =>
    //                 import("@/views/currencies/CurrenciesList.vue").then((m) => m.default || m),
    //         }
    //     ],
    // }
];

export default routes;
