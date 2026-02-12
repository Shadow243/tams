// @ts-nocheck
import { defineStore } from "pinia";
import { $axios } from "@/plugins/axios";
import { handleError, showSuccessMessage } from "@/utils/notification";
import { objectToFormData } from "@/utils/object-utils";

interface CrudState {
    model: Record<string, unknown> | null;
    route: string | null;
    resource: string | null;
    loading: boolean;
    deleting: boolean;
}
interface Payload {
    id?: number | string;
    [key: string]: unknown;
}

export const useCrudStore = defineStore(
    "crud",
    {
        state: (): CrudState => ({
            model: null,
            route: null,
            resource: null,
            loading: false,
            deleting: false,
        }),
        getters: {
            currentModel: (state) => state.model,
        },
        actions: {

            setModel(payload: Partial<CrudState> & { model?: Record<string, unknown> | null }) {
                for (const key in payload) {
                    if (Object.prototype.hasOwnProperty.call(this, key)) {
                        (this as any)[key] = payload[key as keyof typeof payload];
                    }
                }
                if (payload.model?.id) {
                    this.model = payload.model;
                } else {
                    this.model = null;
                }
            },


            async createOrUpdate(payload: Payload): Promise<unknown> {
                try {
                    this.loading = true;
                    let response = null;
                    if (payload && payload.id) {
                        const id = payload.id;
                        payload["_method"] = "PUT";
                        const { data } = await $axios.post(
                            `${this.route}/${id}`,
                            objectToFormData(payload)
                        );
                        response = data;
                    } else {
                        const { data } = await $axios.post(
                            `${this.route}`,
                            objectToFormData(payload)
                        );
                        response = data;
                    }
                    if (response && response.data) {
                        showSuccessMessage(response.message);
                    }
                    return response;
                } catch (error) {
                    handleError(error);
                    throw error;
                } finally {
                    this.loading = false;
                }
            },


            deleteCrud(payload: { route: string; id: string | number }): Promise<unknown> | void {
                const { route, id } = payload;
                if (route && id) {
                    this.deleting = true;
                    showSuccessMessage("Suppression en cours ...", "Patientez");
                    return $axios
                        .delete(`${route}/${id}`)
                        .then(({ data: response }) => {
                            const { data, message } = response;
                            if (data) {
                                showSuccessMessage(message);
                            }
                            this.deleting = false;
                            return data;
                        })
                        .catch((error) => {
                            this.deleting = false;
                            handleError(error);
                            throw error;
                        });
                }
            },
        },
    }
);
