window.matchMedia || (window.matchMedia = function() {
    "use strict";
    var styleMedia = window.styleMedia || window.media;
    if (!styleMedia) {
        var style = document.createElement("style"), script = document.getElementsByTagName("script")[0], info = null;
        style.type = "text/css", style.id = "matchmediajs-test", script.parentNode.insertBefore(style, script), 
        info = "getComputedStyle" in window && window.getComputedStyle(style, null) || style.currentStyle, 
        styleMedia = {
            matchMedium: function(media) {
                var text = "@media " + media + "{ #matchmediajs-test { width: 1px; } }";
                return style.styleSheet ? style.styleSheet.cssText = text : style.textContent = text, 
                "1px" === info.width;
            }
        };
    }
    return function(media) {
        return {
            matches: styleMedia.matchMedium(media || "all"),
            media: media || "all"
        };
    };
}()), function(w, doc, image) {
    "use strict";
    function expose(picturefill) {
        "object" == typeof module && "object" == typeof module.exports ? module.exports = picturefill : "function" == typeof define && define.amd && define("picturefill", function() {
            return picturefill;
        }), "object" == typeof w && (w.picturefill = picturefill);
    }
    function picturefill(opt) {
        var elements, element, parent, firstMatch, candidates, options = opt || {};
        elements = options.elements || pf.getAllElements();
        for (var i = 0, plen = elements.length; plen > i; i++) if (element = elements[i], 
        parent = element.parentNode, firstMatch = void 0, candidates = void 0, "IMG" === element.nodeName.toUpperCase() && (element[pf.ns] || (element[pf.ns] = {}), 
        options.reevaluate || !element[pf.ns].evaluated)) {
            if (parent && "PICTURE" === parent.nodeName.toUpperCase()) {
                if (pf.removeVideoShim(parent), firstMatch = pf.getMatch(element, parent), firstMatch === !1) continue;
            } else firstMatch = void 0;
            (parent && "PICTURE" === parent.nodeName.toUpperCase() || !pf.sizesSupported && element.srcset && regWDesc.test(element.srcset)) && pf.dodgeSrcset(element), 
            firstMatch ? (candidates = pf.processSourceSet(firstMatch), pf.applyBestCandidate(candidates, element)) : (candidates = pf.processSourceSet(element), 
            (void 0 === element.srcset || element[pf.ns].srcset) && pf.applyBestCandidate(candidates, element)), 
            element[pf.ns].evaluated = !0;
        }
    }
    function runPicturefill() {
        function checkResize() {
            clearTimeout(resizeTimer), resizeTimer = setTimeout(handleResize, 60);
        }
        pf.initTypeDetects(), picturefill();
        var resizeTimer, intervalId = setInterval(function() {
            return picturefill(), /^loaded|^i|^c/.test(doc.readyState) ? void clearInterval(intervalId) : void 0;
        }, 250), handleResize = function() {
            picturefill({
                reevaluate: !0
            });
        };
        w.addEventListener ? w.addEventListener("resize", checkResize, !1) : w.attachEvent && w.attachEvent("onresize", checkResize);
    }
    if (w.HTMLPictureElement) return void expose(function() {});
    doc.createElement("picture");
    var pf = w.picturefill || {}, regWDesc = /\s+\+?\d+(e\d+)?w/;
    pf.ns = "picturefill", function() {
        pf.srcsetSupported = "srcset" in image, pf.sizesSupported = "sizes" in image, pf.curSrcSupported = "currentSrc" in image;
    }(), pf.trim = function(str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
    }, pf.makeUrl = function() {
        var anchor = doc.createElement("a");
        return function(src) {
            return anchor.href = src, anchor.href;
        };
    }(), pf.restrictsMixedContent = function() {
        return "https:" === w.location.protocol;
    }, pf.matchesMedia = function(media) {
        return w.matchMedia && w.matchMedia(media).matches;
    }, pf.getDpr = function() {
        return w.devicePixelRatio || 1;
    }, pf.getWidthFromLength = function(length) {
        var cssValue;
        if (!length || length.indexOf("%") > -1 != !1 || !(parseFloat(length) > 0 || length.indexOf("calc(") > -1)) return !1;
        length = length.replace("vw", "%"), pf.lengthEl || (pf.lengthEl = doc.createElement("div"), 
        pf.lengthEl.style.cssText = "border:0;display:block;font-size:1em;left:0;margin:0;padding:0;position:absolute;visibility:hidden", 
        pf.lengthEl.className = "helper-from-picturefill-js"), pf.lengthEl.style.width = "0px";
        try {
            pf.lengthEl.style.width = length;
        } catch (e) {}
        return doc.body.appendChild(pf.lengthEl), cssValue = pf.lengthEl.offsetWidth, 0 >= cssValue && (cssValue = !1), 
        doc.body.removeChild(pf.lengthEl), cssValue;
    }, pf.detectTypeSupport = function(type, typeUri) {
        var image = new w.Image();
        return image.onerror = function() {
            pf.types[type] = !1, picturefill();
        }, image.onload = function() {
            pf.types[type] = 1 === image.width, picturefill();
        }, image.src = typeUri, "pending";
    }, pf.types = pf.types || {}, pf.initTypeDetects = function() {
        pf.types["image/jpeg"] = !0, pf.types["image/gif"] = !0, pf.types["image/png"] = !0, 
        pf.types["image/svg+xml"] = doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1"), 
        pf.types["image/webp"] = pf.detectTypeSupport("image/webp", "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=");
    }, pf.verifyTypeSupport = function(source) {
        var type = source.getAttribute("type");
        if (null === type || "" === type) return !0;
        var pfType = pf.types[type];
        return "string" == typeof pfType && "pending" !== pfType ? (pf.types[type] = pf.detectTypeSupport(type, pfType), 
        "pending") : "function" == typeof pfType ? (pfType(), "pending") : pfType;
    }, pf.parseSize = function(sourceSizeStr) {
        var match = /(\([^)]+\))?\s*(.+)/g.exec(sourceSizeStr);
        return {
            media: match && match[1],
            length: match && match[2]
        };
    }, pf.findWidthFromSourceSize = function(sourceSizeListStr) {
        for (var winningLength, sourceSizeList = pf.trim(sourceSizeListStr).split(/\s*,\s*/), i = 0, len = sourceSizeList.length; len > i; i++) {
            var sourceSize = sourceSizeList[i], parsedSize = pf.parseSize(sourceSize), length = parsedSize.length, media = parsedSize.media;
            if (length && (!media || pf.matchesMedia(media)) && (winningLength = pf.getWidthFromLength(length))) break;
        }
        return winningLength || Math.max(w.innerWidth || 0, doc.documentElement.clientWidth);
    }, pf.parseSrcset = function(srcset) {
        for (var candidates = []; "" !== srcset; ) {
            srcset = srcset.replace(/^\s+/g, "");
            var url, pos = srcset.search(/\s/g), descriptor = null;
            if (-1 !== pos) {
                url = srcset.slice(0, pos);
                var last = url.slice(-1);
                if (("," === last || "" === url) && (url = url.replace(/,+$/, ""), descriptor = ""), 
                srcset = srcset.slice(pos + 1), null === descriptor) {
                    var descpos = srcset.indexOf(",");
                    -1 !== descpos ? (descriptor = srcset.slice(0, descpos), srcset = srcset.slice(descpos + 1)) : (descriptor = srcset, 
                    srcset = "");
                }
            } else url = srcset, srcset = "";
            (url || descriptor) && candidates.push({
                url: url,
                descriptor: descriptor
            });
        }
        return candidates;
    }, pf.parseDescriptor = function(descriptor, sizesattr) {
        var resCandidate, sizes = sizesattr || "100vw", sizeDescriptor = descriptor && descriptor.replace(/(^\s+|\s+$)/g, ""), widthInCssPixels = pf.findWidthFromSourceSize(sizes);
        if (sizeDescriptor) for (var splitDescriptor = sizeDescriptor.split(" "), i = splitDescriptor.length - 1; i >= 0; i--) {
            var curr = splitDescriptor[i], lastchar = curr && curr.slice(curr.length - 1);
            if ("h" !== lastchar && "w" !== lastchar || pf.sizesSupported) {
                if ("x" === lastchar) {
                    var res = curr && parseFloat(curr, 10);
                    resCandidate = res && !isNaN(res) ? res : 1;
                }
            } else resCandidate = parseFloat(parseInt(curr, 10) / widthInCssPixels);
        }
        return resCandidate || 1;
    }, pf.getCandidatesFromSourceSet = function(srcset, sizes) {
        for (var candidates = pf.parseSrcset(srcset), formattedCandidates = [], i = 0, len = candidates.length; len > i; i++) {
            var candidate = candidates[i];
            formattedCandidates.push({
                url: candidate.url,
                resolution: pf.parseDescriptor(candidate.descriptor, sizes)
            });
        }
        return formattedCandidates;
    }, pf.dodgeSrcset = function(img) {
        img.srcset && (img[pf.ns].srcset = img.srcset, img.srcset = "", img.setAttribute("data-pfsrcset", img[pf.ns].srcset));
    }, pf.processSourceSet = function(el) {
        var srcset = el.getAttribute("srcset"), sizes = el.getAttribute("sizes"), candidates = [];
        return "IMG" === el.nodeName.toUpperCase() && el[pf.ns] && el[pf.ns].srcset && (srcset = el[pf.ns].srcset), 
        srcset && (candidates = pf.getCandidatesFromSourceSet(srcset, sizes)), candidates;
    }, pf.backfaceVisibilityFix = function(picImg) {
        var style = picImg.style || {}, WebkitBackfaceVisibility = "webkitBackfaceVisibility" in style, currentZoom = style.zoom;
        WebkitBackfaceVisibility && (style.zoom = ".999", WebkitBackfaceVisibility = picImg.offsetWidth, 
        style.zoom = currentZoom);
    }, pf.setIntrinsicSize = function() {
        var urlCache = {}, setSize = function(picImg, width, res) {
            width && picImg.setAttribute("width", parseInt(width / res, 10));
        };
        return function(picImg, bestCandidate) {
            var img;
            picImg[pf.ns] && !w.pfStopIntrinsicSize && (void 0 === picImg[pf.ns].dims && (picImg[pf.ns].dims = picImg.getAttribute("width") || picImg.getAttribute("height")), 
            picImg[pf.ns].dims || (bestCandidate.url in urlCache ? setSize(picImg, urlCache[bestCandidate.url], bestCandidate.resolution) : (img = doc.createElement("img"), 
            img.onload = function() {
                if (urlCache[bestCandidate.url] = img.width, !urlCache[bestCandidate.url]) try {
                    doc.body.appendChild(img), urlCache[bestCandidate.url] = img.width || img.offsetWidth, 
                    doc.body.removeChild(img);
                } catch (e) {}
                picImg.src === bestCandidate.url && setSize(picImg, urlCache[bestCandidate.url], bestCandidate.resolution), 
                picImg = null, img.onload = null, img = null;
            }, img.src = bestCandidate.url)));
        };
    }(), pf.applyBestCandidate = function(candidates, picImg) {
        var candidate, length, bestCandidate;
        candidates.sort(pf.ascendingSort), length = candidates.length, bestCandidate = candidates[length - 1];
        for (var i = 0; length > i; i++) if (candidate = candidates[i], candidate.resolution >= pf.getDpr()) {
            bestCandidate = candidate;
            break;
        }
        bestCandidate && (bestCandidate.url = pf.makeUrl(bestCandidate.url), picImg.src !== bestCandidate.url && (pf.restrictsMixedContent() && "http:" === bestCandidate.url.substr(0, "http:".length).toLowerCase() ? void 0 !== window.console && console.warn("Blocked mixed content image " + bestCandidate.url) : (picImg.src = bestCandidate.url, 
        pf.curSrcSupported || (picImg.currentSrc = picImg.src), pf.backfaceVisibilityFix(picImg))), 
        pf.setIntrinsicSize(picImg, bestCandidate));
    }, pf.ascendingSort = function(a, b) {
        return a.resolution - b.resolution;
    }, pf.removeVideoShim = function(picture) {
        var videos = picture.getElementsByTagName("video");
        if (videos.length) {
            for (var video = videos[0], vsources = video.getElementsByTagName("source"); vsources.length; ) picture.insertBefore(vsources[0], video);
            video.parentNode.removeChild(video);
        }
    }, pf.getAllElements = function() {
        for (var elems = [], imgs = doc.getElementsByTagName("img"), h = 0, len = imgs.length; len > h; h++) {
            var currImg = imgs[h];
            ("PICTURE" === currImg.parentNode.nodeName.toUpperCase() || null !== currImg.getAttribute("srcset") || currImg[pf.ns] && null !== currImg[pf.ns].srcset) && elems.push(currImg);
        }
        return elems;
    }, pf.getMatch = function(img, picture) {
        for (var match, sources = picture.childNodes, j = 0, slen = sources.length; slen > j; j++) {
            var source = sources[j];
            if (1 === source.nodeType) {
                if (source === img) return match;
                if ("SOURCE" === source.nodeName.toUpperCase()) {
                    null !== source.getAttribute("src") && void 0 !== typeof console && console.warn("The `src` attribute is invalid on `picture` `source` element; instead, use `srcset`.");
                    var media = source.getAttribute("media");
                    if (source.getAttribute("srcset") && (!media || pf.matchesMedia(media))) {
                        var typeSupported = pf.verifyTypeSupport(source);
                        if (typeSupported === !0) {
                            match = source;
                            break;
                        }
                        if ("pending" === typeSupported) return !1;
                    }
                }
            }
        }
        return match;
    }, runPicturefill(), picturefill._ = pf, expose(picturefill);
}(window, window.document, new window.Image()), function(window) {
    var ua = navigator.userAgent;
    window.HTMLPictureElement && /ecko/.test(ua) && ua.match(/rv\:(\d+)/) && RegExp.$1 < 41 && addEventListener("resize", function() {
        var timer, dummySrc = document.createElement("source"), fixRespimg = function(img) {
            var source, sizes, picture = img.parentNode;
            "PICTURE" === picture.nodeName.toUpperCase() ? (source = dummySrc.cloneNode(), picture.insertBefore(source, picture.firstElementChild), 
            setTimeout(function() {
                picture.removeChild(source);
            })) : (!img._pfLastSize || img.offsetWidth > img._pfLastSize) && (img._pfLastSize = img.offsetWidth, 
            sizes = img.sizes, img.sizes += ",100vw", setTimeout(function() {
                img.sizes = sizes;
            }));
        }, findPictureImgs = function() {
            var i, imgs = document.querySelectorAll("picture > img, img[srcset][sizes]");
            for (i = 0; i < imgs.length; i++) fixRespimg(imgs[i]);
        }, onResize = function() {
            clearTimeout(timer), timer = setTimeout(findPictureImgs, 99);
        }, mq = window.matchMedia && matchMedia("(orientation: landscape)"), init = function() {
            onResize(), mq && mq.addListener && mq.addListener(onResize);
        };
        return dummySrc.srcset = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==", 
        /^[c|i]|d$/.test(document.readyState || "") ? init() : document.addEventListener("DOMContentLoaded", init), 
        onResize;
    }());
}(window);