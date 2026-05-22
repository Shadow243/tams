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
        path: "/profile",
        name: "profile",
        component: () => import("@/views/ProfileView.vue").then((m) => m.default || m),
        meta: {
            title: "My Profile",
            middleware: "auth",
        },
    },
    {
        path: "/settings",
        name: "settings",
        component: () => import("@/views/SettingsView.vue").then((m) => m.default || m),
        meta: {
            title: "Account Settings",
            middleware: "auth",
        },
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
    },
    {
        path: "/configurations/countries",
        component: () =>
            import("@/views/configurations/CountriesIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "countries.index",
                redirect: { name: "countries.list" },
            },
            {
                path: "list",
                name: "countries.list",
                component: () =>
                    import("@/views/configurations/countries.vue").then((m) => m.default || m),
            }
        ],
    },
    {
        path: "/configurations/operators",
        component: () =>
            import("@/views/configurations/OperatorsIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "operators.index",
                redirect: { name: "operators.list" },
            },
            {
                path: "list",
                name: "operators.list",
                component: () =>
                    import("@/views/configurations/operators.vue").then((m) => m.default || m),
            }
        ],
    },
    {
        path: "/configurations/branches",
        component: () =>
            import("@/views/configurations/BranchesIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "branches.index",
                redirect: { name: "branches.list" },
            },
            {
                path: "list",
                name: "branches.list",
                component: () =>
                    import("@/views/configurations/branches.vue").then((m) => m.default || m),
            }
        ],
    },
    {
        path: "/configurations/wallets",
        component: () =>
            import("@/views/configurations/WalletsIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "wallets.index",
                redirect: { name: "wallets.list" },
            },
            {
                path: "list",
                name: "wallets.list",
                component: () =>
                    import("@/views/configurations/wallets.vue").then((m) => m.default || m),
            }
        ],
    },
    {
        path: "/configurations/transaction-types",
        component: () =>
            import("@/views/configurations/TransactionTypesIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "transaction-types.index",
                redirect: { name: "transaction-types.list" },
            },
            {
                path: "list",
                name: "transaction-types.list",
                component: () =>
                    import("@/views/configurations/transaction-types.vue").then((m) => m.default || m),
            }
        ],
    },
    {
        path: "/configurations/fee-rules",
        component: () =>
            import("@/views/configurations/FeeRulesIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "fee-rules.index",
                redirect: { name: "fee-rules.list" },
            },
            {
                path: "list",
                name: "fee-rules.list",
                component: () =>
                    import("@/views/configurations/fee-rules.vue").then((m) => m.default || m),
            }
        ],
    },
    {
        path: "/transactions",
        component: () =>
            import("@/views/transactions/TransactionsIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "transactions.index",
                redirect: { name: "transactions.list" },
            },
            {
                path: "list",
                name: "transactions.list",
                component: () =>
                    import("@/views/transactions/transactions.vue").then((m) => m.default || m),
            }
        ],
    },
    {
        path: "/configurations/currencies",
        name: "currencies.list",
        component: () =>
            import("@/views/currencies/currencies.vue").then((m) => m.default || m),
        meta: {
            title: "Currencies",
            middleware: "auth",
        },
    },
    {
        path: "/customer-accounts",
        component: () =>
            import("@/views/customer-accounts/CustomerAccountsIndex.vue").then((m) => m.default || m),
        children: [
            {
                path: "",
                name: "customer-accounts.index",
                redirect: { name: "customer-accounts.list" },
            },
            {
                path: "list",
                name: "customer-accounts.list",
                component: () =>
                    import("@/views/customer-accounts/customer-accounts.vue").then((m) => m.default || m),
            },
            {
                path: ":id",
                name: "customer-account-details",
                component: () =>
                    import("@/views/customer-accounts/CustomerAccountDetail.vue").then((m) => m.default || m),
            },
        ],
    }
];

export default routes;
