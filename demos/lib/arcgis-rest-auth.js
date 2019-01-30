var arcgis_rest_auth=function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(r){return e[r]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=0)}([function(e,r,t){
/* @preserve
* @esri/arcgis-rest-auth - v1.16.1 - Apache-2.0
* Copyright (c) 2017-2019 Esri, Inc.
* Wed Jan 30 2019 12:52:23 GMT-0800 (Pacific Standard Time)
*/
!function(e,r){"use strict";var t=function(){return(t=Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++)for(var o in r=arguments[t])Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o]);return e}).apply(this,arguments)};function n(e,t){var n=t.params?t:{params:t};return r.request(e,n).then(function(e){var r={token:e.access_token,username:e.username,expires:new Date(Date.now()+(1e3*e.expires_in-1e3)),ssl:!0===e.ssl};return e.refresh_token&&(r.refreshToken=e.refresh_token),r})}var o=function(){function e(e){this.clientId=e.clientId,this.clientSecret=e.clientSecret,this.token=e.token,this.expires=e.expires,this.portal=e.portal||"https://www.arcgis.com/sharing/rest",this.duration=e.duration||7200}return e.prototype.getToken=function(e,r){return this.token&&this.expires&&this.expires.getTime()>Date.now()?Promise.resolve(this.token):this._pendingTokenRequest?this._pendingTokenRequest:(this._pendingTokenRequest=this.refreshToken(r),this._pendingTokenRequest)},e.prototype.refreshToken=function(e){var r=this,o=t({params:{client_id:this.clientId,client_secret:this.clientSecret,grant_type:"client_credentials",expiration:this.duration}},e);return n(this.portal+"/oauth2/token/",o).then(function(e){return r._pendingTokenRequest=null,r.token=e.token,r.expires=e.expires,e.token})},e.prototype.refreshSession=function(){var e=this;return this.refreshToken().then(function(){return e})},e}();function s(e,t){var n=t.params?t:{params:t};return"undefined"!=typeof window&&window.location&&window.location.host?n.params.referer=window.location.host:n.params.referer=r.NODEJS_DEFAULT_REFERER_HEADER,r.request(e,n)}var i=function(){function e(e){this.clientId=e.clientId,this._refreshToken=e.refreshToken,this._refreshTokenExpires=e.refreshTokenExpires,this.username=e.username,this.password=e.password,this._token=e.token,this._tokenExpires=e.tokenExpires,this.portal=e.portal?r.cleanUrl(e.portal):"https://www.arcgis.com/sharing/rest",this.ssl=e.ssl,this.provider=e.provider||"arcgis",this.tokenDuration=e.tokenDuration||20160,this.redirectUri=e.redirectUri,this.refreshTokenTTL=e.refreshTokenTTL||1440,this.trustedServers={},this._pendingTokenRequests={}}return e.beginOAuth2=function(n,o){void 0===o&&(o=window);var s,i=t({portal:"https://www.arcgis.com/sharing/rest",provider:"arcgis",duration:20160,popup:!0,state:n.clientId,locale:""},n),a=i.portal,u=i.provider,c=i.clientId,h=i.duration,p=i.redirectUri,f=i.popup,l=i.state,d=i.locale;if(s="arcgis"===u?a+"/oauth2/authorize?client_id="+c+"&response_type=token&expiration="+h+"&redirect_uri="+encodeURIComponent(p)+"&state="+l+"&locale="+d:a+"/oauth2/social/authorize?client_id="+c+"&socialLoginProviderName="+u+"&autoAccountCreateForSocial=true&response_type=token&expiration="+h+"&redirect_uri="+encodeURIComponent(p)+"&state="+l+"&locale="+d,f){var k,m=((k={promise:null,resolve:null,reject:null}).promise=new Promise(function(e,r){k.resolve=e,k.reject=r}),k);return o["__ESRI_REST_AUTH_HANDLER_"+c]=function(t,n){if(t){var o=JSON.parse(t);m.reject(new r.ArcGISAuthError(o.errorMessage,o.error))}else if(n){var s=JSON.parse(n);m.resolve(new e({clientId:c,portal:a,ssl:s.ssl,token:s.token,tokenExpires:new Date(s.expires),username:s.username}))}},o.open(s,"oauth-window","height=400,width=600,menubar=no,location=yes,resizable=yes,scrollbars=yes,status=yes"),m.promise}o.location.href=s},e.completeOAuth2=function(n,o){void 0===o&&(o=window);var s=t({portal:"https://www.arcgis.com/sharing/rest"},n),i=s.portal,a=s.clientId;function u(t,n){if(o.opener&&o.opener.parent)return o.opener.parent["__ESRI_REST_AUTH_HANDLER_"+a](t?JSON.stringify(t):void 0,JSON.stringify(n)),void o.close();if(o!==o.parent)return o.parent["__ESRI_REST_AUTH_HANDLER_"+a](t?JSON.stringify(t):void 0,JSON.stringify(n)),void o.close();if(t)throw new r.ArcGISAuthError(t.errorMessage,t.error);return new e({clientId:a,portal:i,ssl:n.ssl,token:n.token,tokenExpires:n.expires,username:n.username})}var c=o.location.href.match(/access_token=(.+)&expires_in=(.+)&username=([^&]+)/);if(!c){var h=o.location.href.match(/error=(.+)&error_description=(.+)/);return u({error:h[1],errorMessage:decodeURIComponent(h[2])})}var p=c[1],f=new Date(Date.now()+1e3*parseInt(c[2],10)-6e4),l=decodeURIComponent(c[3]);return u(void 0,{token:p,expires:f,ssl:o.location.href.indexOf("&ssl=true")>-1||o.location.href.indexOf("#ssl=true")>-1,username:l})},e.authorize=function(e,r){var n=t({portal:"https://arcgis.com/sharing/rest",duration:20160},e),o=n.portal,s=n.clientId,i=n.duration,a=n.redirectUri;r.writeHead(301,{Location:o+"/oauth2/authorize?client_id="+s+"&duration="+i+"&response_type=code&redirect_uri="+encodeURIComponent(a)}),r.end()},e.exchangeAuthorizationCode=function(r,o){var s=t({portal:"https://www.arcgis.com/sharing/rest",refreshTokenTTL:1440},r),i=s.portal,a=s.clientId,u=s.redirectUri,c=s.refreshTokenTTL;return n(i+"/oauth2/token",{grant_type:"authorization_code",client_id:a,redirect_uri:u,code:o}).then(function(r){return new e({clientId:a,portal:i,ssl:r.ssl,redirectUri:u,refreshToken:r.refreshToken,refreshTokenTTL:c,refreshTokenExpires:new Date(Date.now()+1e3*(c-1)),token:r.token,tokenExpires:r.expires,username:r.username})})},e.deserialize=function(r){var t=JSON.parse(r);return new e({clientId:t.clientId,refreshToken:t.refreshToken,refreshTokenExpires:new Date(t.refreshTokenExpires),username:t.username,password:t.password,token:t.token,tokenExpires:new Date(t.tokenExpires),portal:t.portal,ssl:t.ssl,tokenDuration:t.tokenDuration,redirectUri:t.redirectUri,refreshTokenTTL:t.refreshTokenTTL})},e.fromCredential=function(r){return new e({portal:r.server.includes("sharing/rest")?r.server:r.server+"/sharing/rest",ssl:r.ssl,token:r.token,username:r.userId,tokenExpires:new Date(r.expires)})},Object.defineProperty(e.prototype,"token",{get:function(){return this._token},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"tokenExpires",{get:function(){return this._tokenExpires},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"refreshToken",{get:function(){return this._refreshToken},enumerable:!0,configurable:!0}),Object.defineProperty(e.prototype,"refreshTokenExpires",{get:function(){return this._refreshTokenExpires},enumerable:!0,configurable:!0}),e.prototype.toCredential=function(){return{expires:this.tokenExpires.getTime(),server:this.portal,ssl:this.ssl,token:this.token,userId:this.username}},e.prototype.getUser=function(e){var n=this;if(this._user&&this._user.username===this.username)return Promise.resolve(this._user);var o=this.portal+"/community/users/"+encodeURIComponent(this.username),s=t({httpMethod:"GET",authentication:this},e);return r.request(o,s).then(function(e){return n._user=e,e})},e.prototype.getToken=function(e,r){return/^https?:\/\/\S+\.arcgis\.com\/sharing\/rest/.test(this.portal)&&/^https?:\/\/\S+\.arcgis\.com.+/.test(e)?this.getFreshToken(r):new RegExp(this.portal,"i").test(e)?this.getFreshToken(r):this.getTokenForServer(e,r)},e.prototype.toJSON=function(){return{clientId:this.clientId,refreshToken:this.refreshToken,refreshTokenExpires:this.refreshTokenExpires,username:this.username,password:this.password,token:this.token,tokenExpires:this.tokenExpires,portal:this.portal,ssl:this.ssl,tokenDuration:this.tokenDuration,redirectUri:this.redirectUri,refreshTokenTTL:this.refreshTokenTTL}},e.prototype.serialize=function(){return JSON.stringify(this)},e.prototype.refreshSession=function(e){return this._user=null,this.username&&this.password?this.refreshWithUsernameAndPassword(e):this.clientId&&this.refreshToken?this.refreshWithRefreshToken():Promise.reject(new r.ArcGISAuthError("Unable to refresh token."))},e.prototype.getTokenForServer=function(e,t){var n=this,o=e.toLowerCase().split(/\/rest(\/admin)?\/services\//)[0],i=this.trustedServers[o];return i&&i.expires.getTime()>Date.now()?Promise.resolve(i.token):this._pendingTokenRequests[o]?this._pendingTokenRequests[o]:(this._pendingTokenRequests[o]=r.request(o+"/rest/info").then(function(e){return e.owningSystemUrl}).then(function(o){if(!o||!new RegExp(o,"i").test(n.portal))throw new r.ArcGISAuthError(e+" is not federated with "+n.portal+".","NOT_FEDERATED");return r.request(o+"/sharing/rest/info",t)}).then(function(e){return e.authInfo.tokenServicesUrl}).then(function(r){return n.token?s(r,{params:{token:n.token,serverUrl:e,expiration:n.tokenDuration}}):s(r,{params:{username:n.username,password:n.password,expiration:n.tokenDuration}}).then(function(e){return n._token=e.token,n._tokenExpires=new Date(e.expires),e})}).then(function(e){return n.trustedServers[o]={expires:new Date(e.expires),token:e.token},e.token}),this._pendingTokenRequests[o])},e.prototype.getFreshToken=function(e){var r=this;return this.token&&this.tokenExpires&&this.tokenExpires.getTime()>Date.now()?Promise.resolve(this.token):(this._pendingTokenRequests[this.portal]||(this._pendingTokenRequests[this.portal]=this.refreshSession(e).then(function(e){return r._pendingTokenRequests[r.portal]=null,e.token})),this._pendingTokenRequests[this.portal])},e.prototype.refreshWithUsernameAndPassword=function(e){var r=this,n=t({params:{username:this.username,password:this.password,expiration:this.tokenDuration}},e);return s(this.portal+"/generateToken",n).then(function(e){return r._token=e.token,r._tokenExpires=new Date(e.expires),r})},e.prototype.refreshWithRefreshToken=function(e){var r=this;if(this.refreshToken&&this.refreshTokenExpires&&this.refreshTokenExpires.getTime()<Date.now())return this.refreshRefreshToken(e);var o=t({params:{client_id:this.clientId,refresh_token:this.refreshToken,grant_type:"refresh_token"}},e);return n(this.portal+"/oauth2/token",o).then(function(e){return r._token=e.token,r._tokenExpires=e.expires,r})},e.prototype.refreshRefreshToken=function(e){var r=this,o=t({params:{client_id:this.clientId,refresh_token:this.refreshToken,redirect_uri:this.redirectUri,grant_type:"exchange_refresh_token"}},e);return n(this.portal+"/oauth2/token",o).then(function(e){return r._token=e.token,r._tokenExpires=e.expires,r._refreshToken=e.refreshToken,r._refreshTokenExpires=new Date(Date.now()+60*(r.refreshTokenTTL-1)*1e3),r})},e}();e.ApplicationSession=o,e.UserSession=i,e.fetchToken=n,e.generateToken=s,Object.defineProperty(e,"__esModule",{value:!0})}(r,t(1))},function(e,r,t){"use strict";t.r(r);
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
var n=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,r){e.__proto__=r}||function(e,r){for(var t in r)r.hasOwnProperty(t)&&(e[t]=r[t])};var o=Object.assign||function(e){for(var r,t=1,n=arguments.length;t<n;t++)for(var o in r=arguments[t])Object.prototype.hasOwnProperty.call(r,o)&&(e[o]=r[o]);return e};function s(e){return Object.keys(e).some(function(r){var t=e[r];if(!t)return!1;switch(t.constructor.name){case"Array":case"Object":case"Date":case"Function":case"Boolean":case"String":case"Number":return!1;default:return!0}})}function i(e){var r={};return Object.keys(e).forEach(function(t){var n=e[t];if(n||0===n||"boolean"==typeof n||"string"==typeof n){var o;switch(n.constructor.name){case"Array":o=n[0]&&n[0].constructor&&"Object"===n[0].constructor.name?JSON.stringify(n):n.join(",");break;case"Object":o=JSON.stringify(n);break;case"Date":o=n.valueOf();break;case"Function":o=null;break;case"Boolean":o=n+"";break;default:o=n}(o||0===o||"string"==typeof o)&&(r[t]=o)}}),r}function a(e,r){return encodeURIComponent(e)+"="+encodeURIComponent(r)}function u(e){var r=i(e);return Object.keys(r).map(function(e){return a(e,r[e])}).join("&")}function c(e){var r=s(e),t=i(e);if(r){var n=new FormData;return Object.keys(t).forEach(function(e){if("undefined"!=typeof Blob&&t[e]instanceof Blob){var r=t.fileName||t[e].name||e;n.append(e,t[e],r)}else n.append(e,t[e])}),n}return u(e)}var h=function(){return function(e,r,t,n,o){e=e||"UNKNOWN_ERROR",r=r||"UNKNOWN_ERROR_CODE",this.name="ArcGISRequestError",this.message="UNKNOWN_ERROR_CODE"===r?e:r+": "+e,this.originalMessage=e,this.code=r,this.response=t,this.url=n,this.options=o}}();h.prototype=Object.create(Error.prototype),h.prototype.constructor=h;var p="@esri/arcgis-rest-js";function f(e,r){void 0===r&&(r={params:{f:"json"}});var t=o({httpMethod:"POST"},r),n=[],i=[];if(t.fetch||"undefined"==typeof fetch?(n.push("`fetch`"),i.push("`isomorphic-fetch`")):t.fetch=fetch.bind(Function("return this")()),"undefined"==typeof Promise&&(n.push("`Promise`"),i.push("`es6-promise`")),"undefined"==typeof FormData&&(n.push("`FormData`"),i.push("`isomorphic-form-data`")),!t.fetch||"undefined"==typeof Promise||"undefined"==typeof FormData)throw new Error("`arcgis-rest-request` requires global variables for `fetch`, `Promise` and `FormData` to be present in the global scope. You are missing "+n.join(", ")+". We recommend installing the "+i.join(", ")+" modules at the root of your application to add these to the global scope. See https://bit.ly/2KNwWaJ for more info.");var a=t.httpMethod,f=t.authentication,l=o({f:"json"},r.params),d={method:a,credentials:"same-origin"};return(f?f.getToken(e,{fetch:t.fetch}):Promise.resolve("")).then(function(n){if(n.length&&(l.token=n),"GET"===d.method){var i=""===u(l)?e:e+"?"+u(l);t.maxUrlLength&&i.length>t.maxUrlLength?d.method="POST":e=i}return"POST"===d.method&&(d.body=c(l)),d.headers=o({},r.headers),"undefined"!=typeof window||d.headers.referer||(d.headers.referer=p),s(l)||(d.headers["Content-Type"]="application/x-www-form-urlencoded"),t.fetch(e,d)}).then(function(r){if(!r.ok){var n=r.status,o=r.statusText;throw new h(o,"HTTP "+n,r,e,t)}switch(l.f){case"json":case"geojson":return r.json();case"html":case"text":return r.text();default:return r.blob()}}).then(function(r){return"json"===l.f||"geojson"===l.f?k(r,e,l,t):r})}var l,d=function(e){function r(r,t,n,o,s){void 0===r&&(r="AUTHENTICATION_ERROR"),void 0===t&&(t="AUTHENTICATION_ERROR_CODE");var i=e.call(this,r,t,n,o,s)||this;return i.name="ArcGISAuthError",i.message="AUTHENTICATION_ERROR_CODE"===t?r:t+": "+r,i}return function(e,r){function t(){this.constructor=e}n(e,r),e.prototype=null===r?Object.create(r):(t.prototype=r.prototype,new t)}(r,e),r.prototype.retry=function(e,r){var t=this;void 0===r&&(r=3);var n=0,s=function(i,a){e(t.url,t.options).then(function(e){var r=o({},t.options,{authentication:e});return n+=1,f(t.url,r)}).then(function(e){i(e)}).catch(function(e){"ArcGISAuthError"===e.name&&n<r?s(i,a):"ArcGISAuthError"===e.name&&n>=r?a(t):a(e)})};return new Promise(function(e,r){s(e,r)})},r}(h);function k(e,r,t,n){if(e.code>=400){var o=e.message,s=e.code;throw new h(o,s,e,r,n)}if(e.error){var i=e.error,a=(o=i.message,s=i.code,i.messageCode),u=a||s||"UNKNOWN_ERROR_CODE";if(498===s||499===s||"GWM_0003"===a)throw new d(o,u,e,r,n);throw new h(o,u,e,r,n)}if("failed"===e.status||"failure"===e.status){o=void 0,s="UNKNOWN_ERROR_CODE";try{o=JSON.parse(e.statusMessage).message,s=JSON.parse(e.statusMessage).code}catch(r){o=e.statusMessage||e.message}throw new h(o,s,e,r,n)}return e}function m(e){console&&console.warn&&console.warn.apply(console,[e])}function g(e){return"/"===(e=e.trim())[e.length-1]&&(e=e.slice(0,-1)),e}function _(e){return void 0===e&&(e={}),e.portal?g(e.portal):e.authentication?e.authentication.portal:"https://www.arcgis.com/sharing/rest"}function T(e){return w(null,e)}function w(e,r){var t=e||"self";return f(_(r)+"/portals/"+t,o({httpMethod:"GET"},r))}function v(e,r){Object.keys(e).forEach(function(t){"url"!==t&&"params"!==t&&"authentication"!==t&&"httpMethod"!==t&&"fetch"!==t&&"portal"!==t&&"maxUrlLength"!==t&&"headers"!==t&&"endpoint"!==t&&"decodeValues"!==t&&(r.params[t]=e[t])})}!function(e){e.ArcGISRequestError="ArcGISRequestError",e.ArcGISAuthError="ArcGISAuthError"}(l||(l={})),t.d(r,"NODEJS_DEFAULT_REFERER_HEADER",function(){return p}),t.d(r,"request",function(){return f}),t.d(r,"ArcGISAuthError",function(){return d}),t.d(r,"checkForErrors",function(){return k}),t.d(r,"encodeFormData",function(){return c}),t.d(r,"encodeParam",function(){return a}),t.d(r,"encodeQueryString",function(){return u}),t.d(r,"warn",function(){return m}),t.d(r,"ArcGISRequestError",function(){return h}),t.d(r,"ErrorTypes",function(){return l}),t.d(r,"requiresFormData",function(){return s}),t.d(r,"processParams",function(){return i}),t.d(r,"getSelf",function(){return T}),t.d(r,"getPortal",function(){return w}),t.d(r,"getPortalUrl",function(){return _}),t.d(r,"appendCustomParams",function(){return v}),t.d(r,"cleanUrl",function(){return g})}]);