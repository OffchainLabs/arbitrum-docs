"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/scroll-into-view-if-needed";
exports.ids = ["vendor-chunks/scroll-into-view-if-needed"];
exports.modules = {

/***/ "(ssr)/./node_modules/scroll-into-view-if-needed/dist/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/scroll-into-view-if-needed/dist/index.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ e)\n/* harmony export */ });\n/* harmony import */ var compute_scroll_into_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! compute-scroll-into-view */ \"(ssr)/./node_modules/compute-scroll-into-view/dist/index.js\");\nconst o=t=>!1===t?{block:\"end\",inline:\"nearest\"}:(t=>t===Object(t)&&0!==Object.keys(t).length)(t)?t:{block:\"start\",inline:\"nearest\"};function e(e,r){if(!e.isConnected||!(t=>{let o=t;for(;o&&o.parentNode;){if(o.parentNode===document)return!0;o=o.parentNode instanceof ShadowRoot?o.parentNode.host:o.parentNode}return!1})(e))return;const n=(t=>{const o=window.getComputedStyle(t);return{top:parseFloat(o.scrollMarginTop)||0,right:parseFloat(o.scrollMarginRight)||0,bottom:parseFloat(o.scrollMarginBottom)||0,left:parseFloat(o.scrollMarginLeft)||0}})(e);if((t=>\"object\"==typeof t&&\"function\"==typeof t.behavior)(r))return r.behavior((0,compute_scroll_into_view__WEBPACK_IMPORTED_MODULE_0__.compute)(e,r));const l=\"boolean\"==typeof r||null==r?void 0:r.behavior;for(const{el:a,top:i,left:s}of (0,compute_scroll_into_view__WEBPACK_IMPORTED_MODULE_0__.compute)(e,o(r))){const t=i-n.top+n.bottom,o=s-n.left+n.right;a.scroll({top:t,left:o,behavior:l})}}//# sourceMappingURL=index.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvc2Nyb2xsLWludG8tdmlldy1pZi1uZWVkZWQvZGlzdC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFtRCxtQkFBbUIsNkJBQTZCLHFEQUFxRCxnQ0FBZ0MsZ0JBQWdCLHlCQUF5QixRQUFRLEtBQUssZ0JBQWdCLEVBQUUsb0NBQW9DLG9FQUFvRSxTQUFTLFlBQVksYUFBYSxtQ0FBbUMsT0FBTyxpS0FBaUssS0FBSywrRUFBK0UsaUVBQUMsT0FBTyx1REFBdUQsVUFBVSxrQkFBa0IsR0FBRyxpRUFBQyxVQUFVLDRDQUE0QyxVQUFVLHdCQUF3QixHQUF3QiIsInNvdXJjZXMiOlsiL1VzZXJzL2RvdWdsYW5jZS9EZXZlbG9wZXIvb2MvYXJiaXRydW0tZG9jcy9ub2RlX21vZHVsZXMvc2Nyb2xsLWludG8tdmlldy1pZi1uZWVkZWQvZGlzdC9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnR7Y29tcHV0ZSBhcyB0fWZyb21cImNvbXB1dGUtc2Nyb2xsLWludG8tdmlld1wiO2NvbnN0IG89dD0+ITE9PT10P3tibG9jazpcImVuZFwiLGlubGluZTpcIm5lYXJlc3RcIn06KHQ9PnQ9PT1PYmplY3QodCkmJjAhPT1PYmplY3Qua2V5cyh0KS5sZW5ndGgpKHQpP3Q6e2Jsb2NrOlwic3RhcnRcIixpbmxpbmU6XCJuZWFyZXN0XCJ9O2Z1bmN0aW9uIGUoZSxyKXtpZighZS5pc0Nvbm5lY3RlZHx8ISh0PT57bGV0IG89dDtmb3IoO28mJm8ucGFyZW50Tm9kZTspe2lmKG8ucGFyZW50Tm9kZT09PWRvY3VtZW50KXJldHVybiEwO289by5wYXJlbnROb2RlIGluc3RhbmNlb2YgU2hhZG93Um9vdD9vLnBhcmVudE5vZGUuaG9zdDpvLnBhcmVudE5vZGV9cmV0dXJuITF9KShlKSlyZXR1cm47Y29uc3Qgbj0odD0+e2NvbnN0IG89d2luZG93LmdldENvbXB1dGVkU3R5bGUodCk7cmV0dXJue3RvcDpwYXJzZUZsb2F0KG8uc2Nyb2xsTWFyZ2luVG9wKXx8MCxyaWdodDpwYXJzZUZsb2F0KG8uc2Nyb2xsTWFyZ2luUmlnaHQpfHwwLGJvdHRvbTpwYXJzZUZsb2F0KG8uc2Nyb2xsTWFyZ2luQm90dG9tKXx8MCxsZWZ0OnBhcnNlRmxvYXQoby5zY3JvbGxNYXJnaW5MZWZ0KXx8MH19KShlKTtpZigodD0+XCJvYmplY3RcIj09dHlwZW9mIHQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIHQuYmVoYXZpb3IpKHIpKXJldHVybiByLmJlaGF2aW9yKHQoZSxyKSk7Y29uc3QgbD1cImJvb2xlYW5cIj09dHlwZW9mIHJ8fG51bGw9PXI/dm9pZCAwOnIuYmVoYXZpb3I7Zm9yKGNvbnN0e2VsOmEsdG9wOmksbGVmdDpzfW9mIHQoZSxvKHIpKSl7Y29uc3QgdD1pLW4udG9wK24uYm90dG9tLG89cy1uLmxlZnQrbi5yaWdodDthLnNjcm9sbCh7dG9wOnQsbGVmdDpvLGJlaGF2aW9yOmx9KX19ZXhwb3J0e2UgYXMgZGVmYXVsdH07Ly8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/scroll-into-view-if-needed/dist/index.js\n");

/***/ })

};
;