var arcgis_rest_items=function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){
/* @preserve
* @esri/arcgis-rest-items - v1.16.1 - Apache-2.0
* Copyright (c) 2017-2019 Esri, Inc.
* Wed Jan 30 2019 12:52:43 GMT-0800 (Pacific Standard Time)
*/
!function(e,t){"use strict";var r=function(){return(r=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function n(e){var t=JSON.parse(JSON.stringify(e)),r=e.typeKeywords,n=void 0===r?[]:r,o=e.tags,a=void 0===o?[]:o;return t.typeKeywords=n.join(", "),t.tags=a.join(", "),t.data&&(t.text=JSON.stringify(t.data),delete t.data),t.properties&&(t.properties=JSON.stringify(t.properties)),t}function o(e){return e.owner?e.owner:e.item&&e.item.owner?e.item.owner:e.authentication.username}function a(e){var a=o(e),s=t.getPortalUrl(e)+"/content/users/"+a,u=s+"/addItem";return e.folder&&(u=s+"/"+e.folder+"/addItem"),e.params=r({},e.params,n(e.item)),t.request(u,e)}e.addItemJsonData=function(e){var n=o(e),a=t.getPortalUrl(e)+"/content/users/"+n+"/items/"+e.id+"/update";return e.params=r({text:JSON.stringify(e.data)},e.params),t.request(a,e)},e.addItemData=function(e){var n=o(e),a=t.getPortalUrl(e)+"/content/users/"+n+"/items/"+e.id+"/update";return e.params=r({file:e.data},e.params),t.request(a,e)},e.addItemResource=function(e){var n=o(e),a=t.getPortalUrl(e)+"/content/users/"+n+"/items/"+e.id+"/addResources";return e.params=r({file:e.resource,fileName:e.name,text:e.content,access:e.private?"private":"inherit"},e.params),t.request(a,e)},e.createFolder=function(e){var n=o(e),a=t.getPortalUrl(e)+"/content/users/"+n+"/createFolder";return e.params=r({title:e.title},e.params),t.request(a,e)},e.createItemInFolder=a,e.createItem=function(e){return a(r({folder:null},e))},e.getItem=function(e,n){var o=t.getPortalUrl(n)+"/content/items/"+e,a=r({httpMethod:"GET"},n);return t.request(o,a)},e.getItemData=function(e,n){var o=t.getPortalUrl(n)+"/content/items/"+e+"/data",a=r({httpMethod:"GET",params:{}},n);return a.file&&(a.params.f=null),t.request(o,a)},e.getItemResources=function(e){var n=t.getPortalUrl(e)+"/content/items/"+e.id+"/resources";return e.params=r({},e.params,{num:1e3}),t.request(n,e)},e.getItemGroups=function(e,r){var n=t.getPortalUrl(r)+"/content/items/"+e+"/groups";return t.request(n,r)},e.protectItem=function(e){var r=o(e),n=t.getPortalUrl(e)+"/content/users/"+r+"/items/"+e.id+"/protect";return t.request(n,e)},e.unprotectItem=function(e){var r=o(e),n=t.getPortalUrl(e)+"/content/users/"+r+"/items/"+e.id+"/unprotect";return t.request(n,e)},e.removeItem=function(e){var r=o(e),n=t.getPortalUrl(e)+"/content/users/"+r+"/items/"+e.id+"/delete";return t.request(n,e)},e.removeItemResource=function(e){var n=o(e),a=t.getPortalUrl(e)+"/content/users/"+n+"/items/"+e.id+"/removeResources";return e.params=r({},e.params,{resource:e.resource}),t.request(a,e)},e.removeFolder=function(e){var r=o(e),n=t.getPortalUrl(e)+"/content/users/"+encodeURIComponent(r)+"/"+e.folderId+"/delete";return t.request(n,e)},e.searchItems=function(e){var n={httpMethod:"GET",params:{}};"string"==typeof e?n.params.q=e:(n=r({},n,e)).params=r({},e.params,e.searchForm);var o=t.getPortalUrl(n)+"/search";return t.request(o,n)},e.updateItem=function(e){var a=o(e),s=t.getPortalUrl(e)+"/content/users/"+a+"/items/"+e.item.id+"/update";return e.params=r({},e.params,n(e.item)),t.request(s,e)},e.updateItemResource=function(e){var n=o(e),a=t.getPortalUrl(e)+"/content/users/"+n+"/items/"+e.id+"/updateResources";return e.params=r({file:e.resource,fileName:e.name,text:e.content},e.params),void 0!==e.private&&(e.params.access=e.private?"private":"inherit"),t.request(a,e)},e.moveItem=function(e){var n=o(e),a=t.getPortalUrl(e)+"/content/users/"+n+"/items/"+e.itemId+"/move",s=e.folderId;return s||(s="/"),e.params=r({folder:s},e.params),t.request(a,e)},e.serializeItem=n,e.determineOwner=o,Object.defineProperty(e,"__esModule",{value:!0})}(t,r(1))},function(e,t,r){"use strict";r.r(t);
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])};var o=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var o in t=arguments[r])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e};function a(e){return Object.keys(e).some(function(t){var r=e[t];if(!r)return!1;switch(r.constructor.name){case"Array":case"Object":case"Date":case"Function":case"Boolean":case"String":case"Number":return!1;default:return!0}})}function s(e){var t={};return Object.keys(e).forEach(function(r){var n=e[r];if(n||0===n||"boolean"==typeof n||"string"==typeof n){var o;switch(n.constructor.name){case"Array":o=n[0]&&n[0].constructor&&"Object"===n[0].constructor.name?JSON.stringify(n):n.join(",");break;case"Object":o=JSON.stringify(n);break;case"Date":o=n.valueOf();break;case"Function":o=null;break;case"Boolean":o=n+"";break;default:o=n}(o||0===o||"string"==typeof o)&&(t[r]=o)}}),t}function u(e,t){return encodeURIComponent(e)+"="+encodeURIComponent(t)}function i(e){var t=s(e);return Object.keys(t).map(function(e){return u(e,t[e])}).join("&")}function c(e){var t=a(e),r=s(e);if(t){var n=new FormData;return Object.keys(r).forEach(function(e){if("undefined"!=typeof Blob&&r[e]instanceof Blob){var t=r.fileName||r[e].name||e;n.append(e,r[e],t)}else n.append(e,r[e])}),n}return i(e)}var f=function(){return function(e,t,r,n,o){e=e||"UNKNOWN_ERROR",t=t||"UNKNOWN_ERROR_CODE",this.name="ArcGISRequestError",this.message="UNKNOWN_ERROR_CODE"===t?e:t+": "+e,this.originalMessage=e,this.code=t,this.response=r,this.url=n,this.options=o}}();f.prototype=Object.create(Error.prototype),f.prototype.constructor=f;var l="@esri/arcgis-rest-js";function p(e,t){void 0===t&&(t={params:{f:"json"}});var r=o({httpMethod:"POST"},t),n=[],s=[];if(r.fetch||"undefined"==typeof fetch?(n.push("`fetch`"),s.push("`isomorphic-fetch`")):r.fetch=fetch.bind(Function("return this")()),"undefined"==typeof Promise&&(n.push("`Promise`"),s.push("`es6-promise`")),"undefined"==typeof FormData&&(n.push("`FormData`"),s.push("`isomorphic-form-data`")),!r.fetch||"undefined"==typeof Promise||"undefined"==typeof FormData)throw new Error("`arcgis-rest-request` requires global variables for `fetch`, `Promise` and `FormData` to be present in the global scope. You are missing "+n.join(", ")+". We recommend installing the "+s.join(", ")+" modules at the root of your application to add these to the global scope. See https://bit.ly/2KNwWaJ for more info.");var u=r.httpMethod,p=r.authentication,d=o({f:"json"},t.params),m={method:u,credentials:"same-origin"};return(p?p.getToken(e,{fetch:r.fetch}):Promise.resolve("")).then(function(n){if(n.length&&(d.token=n),"GET"===m.method){var s=""===i(d)?e:e+"?"+i(d);r.maxUrlLength&&s.length>r.maxUrlLength?m.method="POST":e=s}return"POST"===m.method&&(m.body=c(d)),m.headers=o({},t.headers),"undefined"!=typeof window||m.headers.referer||(m.headers.referer=l),a(d)||(m.headers["Content-Type"]="application/x-www-form-urlencoded"),r.fetch(e,m)}).then(function(t){if(!t.ok){var n=t.status,o=t.statusText;throw new f(o,"HTTP "+n,t,e,r)}switch(d.f){case"json":case"geojson":return t.json();case"html":case"text":return t.text();default:return t.blob()}}).then(function(t){return"json"===d.f||"geojson"===d.f?h(t,e,d,r):t})}var d,m=function(e){function t(t,r,n,o,a){void 0===t&&(t="AUTHENTICATION_ERROR"),void 0===r&&(r="AUTHENTICATION_ERROR_CODE");var s=e.call(this,t,r,n,o,a)||this;return s.name="ArcGISAuthError",s.message="AUTHENTICATION_ERROR_CODE"===r?t:r+": "+t,s}return function(e,t){function r(){this.constructor=e}n(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)}(t,e),t.prototype.retry=function(e,t){var r=this;void 0===t&&(t=3);var n=0,a=function(s,u){e(r.url,r.options).then(function(e){var t=o({},r.options,{authentication:e});return n+=1,p(r.url,t)}).then(function(e){s(e)}).catch(function(e){"ArcGISAuthError"===e.name&&n<t?a(s,u):"ArcGISAuthError"===e.name&&n>=t?u(r):u(e)})};return new Promise(function(e,t){a(e,t)})},t}(f);function h(e,t,r,n){if(e.code>=400){var o=e.message,a=e.code;throw new f(o,a,e,t,n)}if(e.error){var s=e.error,u=(o=s.message,a=s.code,s.messageCode),i=u||a||"UNKNOWN_ERROR_CODE";if(498===a||499===a||"GWM_0003"===u)throw new m(o,i,e,t,n);throw new f(o,i,e,t,n)}if("failed"===e.status||"failure"===e.status){o=void 0,a="UNKNOWN_ERROR_CODE";try{o=JSON.parse(e.statusMessage).message,a=JSON.parse(e.statusMessage).code}catch(t){o=e.statusMessage||e.message}throw new f(o,a,e,t,n)}return e}function v(e){console&&console.warn&&console.warn.apply(console,[e])}function g(e){return"/"===(e=e.trim())[e.length-1]&&(e=e.slice(0,-1)),e}function y(e){return void 0===e&&(e={}),e.portal?g(e.portal):e.authentication?e.authentication.portal:"https://www.arcgis.com/sharing/rest"}function O(e){return b(null,e)}function b(e,t){var r=e||"self";return p(y(t)+"/portals/"+r,o({httpMethod:"GET"},t))}function E(e,t){Object.keys(e).forEach(function(r){"url"!==r&&"params"!==r&&"authentication"!==r&&"httpMethod"!==r&&"fetch"!==r&&"portal"!==r&&"maxUrlLength"!==r&&"headers"!==r&&"endpoint"!==r&&"decodeValues"!==r&&(t.params[r]=e[r])})}!function(e){e.ArcGISRequestError="ArcGISRequestError",e.ArcGISAuthError="ArcGISAuthError"}(d||(d={})),r.d(t,"NODEJS_DEFAULT_REFERER_HEADER",function(){return l}),r.d(t,"request",function(){return p}),r.d(t,"ArcGISAuthError",function(){return m}),r.d(t,"checkForErrors",function(){return h}),r.d(t,"encodeFormData",function(){return c}),r.d(t,"encodeParam",function(){return u}),r.d(t,"encodeQueryString",function(){return i}),r.d(t,"warn",function(){return v}),r.d(t,"ArcGISRequestError",function(){return f}),r.d(t,"ErrorTypes",function(){return d}),r.d(t,"requiresFormData",function(){return a}),r.d(t,"processParams",function(){return s}),r.d(t,"getSelf",function(){return O}),r.d(t,"getPortal",function(){return b}),r.d(t,"getPortalUrl",function(){return y}),r.d(t,"appendCustomParams",function(){return E}),r.d(t,"cleanUrl",function(){return g})}]);