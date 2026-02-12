// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// import { useCrudStore } from "@/stores/crud";
import logo from "@/assets/images/logo.png";
// import facebook from "@/assets/images/facebook-icon.svg";
// import google from "@/assets/images/google-icon.svg";
// import breadcrumbImg from "@/assets/images/money.png";
import avatarDefault from "@/assets/images/avatar_default.png";
// import welcomeImg from "@/assets/images/welcome-bg.svg";
import $ from "jquery";

export const logoImg = logo;
// export const facebookImg = facebook;
// export const googleImg = google;
// export const breadcrumbImage = breadcrumbImg;
export const avatarImage = avatarDefault;
// export const welcomeImage = welcomeImg;

export const hidePreloader = (): void => {
  const preloader = $("#preloader");
  const loader = $("#loader");
  
  if (preloader.length) {
    preloader.fadeOut(500, function (this: HTMLElement) {
      $(this).hide();
    });
  }
  
  if (loader.length) {
    loader.hide();
  }
};

type AttrChangeCallback = (isActive: boolean) => void;

/**
 * Observe class attribute changes on an element using jQuery attrchange plugin.
 * @param el HTMLElement or jQuery element
 * @param className Class name to watch for
 * @param callback Callback with true if class present, false otherwise
 */
export const observeClassAttribute = (
  el: HTMLElement | JQuery<HTMLElement>,
  className: string,
  callback: AttrChangeCallback
): void => {
  const $el = el instanceof jQuery ? el : $(el);
  // const $el = $(el as HTMLElement);

  $el.attrchange({
    trackValues: true,
    callback(evnt: { attributeName: string; newValue: string }) {
      if (evnt.attributeName === "class") {
        callback(evnt.newValue.includes(className));
      }
    },
  });
};

export const openSideModal = (el: string): void => {
  const $el = $(el);

  // Retire la classe "hidden" et ajoute "open" et "opened"
  $el.removeClass("hidden").addClass("open opened");

  // Empêche le scroll du body
  $("body").css("overflow", "hidden");

  // Ajoute le backdrop
  const backdropId = `${el.replace('#', '')}-backdrop`;

  if ($(`#${backdropId}`).length === 0) {
    const $backdrop = $(`
      <div id="${backdropId}"
           data-hs-overlay-backdrop-template=""
           style="z-index: 59;"
           class="hs-overlay-backdrop transition duration fixed inset-0 bg-gray-900/50 dark:bg-neutral-900/80">
      </div>
    `);

    $("body").append($backdrop);
  }
};

export const closeSideModal = (el: string): Promise<void> => {
  const $el = $(el);

  // Retire les classes "open" et "opened", ajoute "hidden"
  $el.removeClass("open opened").addClass("hidden");

  // Restaure le scroll du body
  $("body").css("overflow", "");

  // Supprime le backdrop
  const backdropId = `${el.replace('#', '')}-backdrop`;
  $(`#${backdropId}`).remove();

  return Promise.resolve();
};

export const showModal = (el: string): void => {

  const $el = $(el);
  let $backdrop = $("#hs-basic-modal-backdrop");

  // Si le backdrop n'existe pas, on le crée et on l'ajoute au DOM
  if ($backdrop.length === 0) {
    $backdrop = $(`
            <div id="hs-basic-modal-backdrop"
                 data-hs-overlay-backdrop-template=""
                 style="z-index: 79;"
                 class="hs-overlay-backdrop transition duration fixed inset-0 bg-gray-900/50 dark:bg-neutral-900/80">
            </div>
        `);
    $("body").append($backdrop);
  }

  // Retire la classe "hidden" et ajoute "open" et "opened"
  $el.removeClass("hidden").addClass("open opened");

  // Empêche le scroll du body
  $("body").css("overflow", "hidden");
};

export const closeModal = (el: string): Promise<void> => {
  const $el = $(el);
  const $backdrop = $("#hs-basic-modal-backdrop");

  // Retire les classes "open" et "opened", ajoute "hidden"
  $el.removeClass("open opened").addClass("hidden");

  // Cache le backdrop si présent
  if ($backdrop.length) {
    $backdrop.removeClass("block").addClass("hidden");
  }

  // Restaure le scroll du body
  $("body").css("overflow", "");

  return Promise.resolve();
};

export const openModal = (payload: unknown): void => {
  // const store = useCrudStore();
  // store.setModel(payload);
  $("#modal-crud").modal("show");
};

export const loadScript = (
  src: string,
  options: { force?: boolean } = { force: false }
): Promise<HTMLScriptElement> => {
  return new Promise((resolve, reject) => {
    let shouldAppend = false;
    let el = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;

    if (options.force || !el) {
      el = document.createElement("script");
      el.type = "text/javascript";
      el.async = true;
      el.src = src;
      shouldAppend = true;
    } else if (el.hasAttribute("data-loaded")) {
      resolve(el);
      return;
    }

    el.addEventListener("error", reject);
    el.addEventListener("abort", reject);
    el.addEventListener("load", () => {
      el!.setAttribute("data-loaded", "true");
      resolve(el!);
    });

    if (shouldAppend) {
      document.body.appendChild(el);
    }
  });
};

export const unloadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(`script[src="${src}"]`);

    if (!el) {
      reject();
      return;
    }

    document.body.removeChild(el);
    resolve();
  });
};