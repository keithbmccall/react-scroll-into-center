"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

require("./ss.css");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var smoothScrollIntoCenter = function smoothScrollIntoCenter(selectedDayRef, selectedDayContainerRef) {
  var _selectedDayContainer;

  if ((selectedDayContainerRef === null || selectedDayContainerRef === void 0 ? void 0 : (_selectedDayContainer = selectedDayContainerRef.current) === null || _selectedDayContainer === void 0 ? void 0 : _selectedDayContainer.getBoundingClientRect) && (selectedDayRef === null || selectedDayRef === void 0 ? void 0 : selectedDayRef.current)) {
    var el = selectedDayRef.current;
    var container = selectedDayContainerRef.current;

    var ease = function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }; // define timing method


    var now = window.performance && window.performance.now ? window.performance.now.bind(window.performance) : Date.now;

    var step = function step(context) {
      var time = now();
      var SCROLL_TIME = 468;
      var elapsed = (time - context.startTime) / SCROLL_TIME; // avoid elapsed times higher than one

      elapsed = elapsed > 1 ? 1 : elapsed; // apply easing to elapsed time

      var value = ease(elapsed);
      var currentX = context.startX + (context.x - context.startX) * value;
      var currentY = context.startY + (context.y - context.startY) * value;
      context.scrollElement(context.element, currentX, currentY); // scroll more if we have not reached our destination

      if (currentX !== context.x || currentY !== context.y) {
        window.requestAnimationFrame(function () {
          return step(context);
        });
      }
    };

    var scrollElement = function scrollElement(element, x, y) {
      element.scrollLeft = x;
      element.scrollTop = y;
    }; // scroll looping over a frame


    var smoothScroll = function smoothScroll(element, x, y) {
      step({
        element: element,
        scrollElement: scrollElement,
        startTime: now(),
        startX: element.scrollLeft,
        startY: element.scrollTop,
        x: x,
        y: y
      });
    };

    var numberizePixel = function numberizePixel(pixel) {
      return parseInt(pixel.replace("px", ""), 10);
    };

    var calculateTrajectory = function calculateTrajectory() {
      var place = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "0";
      var targetCommonWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 80;
      var elementQuantity = arguments.length > 2 ? arguments[2] : undefined;
      // based on the position of selected date
      // and the total amount of dates
      // we will calculate the extra distance needed
      // to accommodate centering selected date
      var middleIndex = Math.floor((elementQuantity - 1) / 2);
      var numberedPlace = parseInt(place, 10);
      var multiple = numberedPlace - middleIndex;
      return targetCommonWidth * multiple;
    };

    var calculateElementWidths = function calculateElementWidths(target, elementQuantity) {
      var _window$getComputedSt = window.getComputedStyle(target),
          paddingRight = _window$getComputedSt.paddingRight,
          paddingLeft = _window$getComputedSt.paddingLeft,
          elementWidth = _window$getComputedSt.width; // used to get the dimensions of the datePickers and the full overflow width of their container


      var padLeft = numberizePixel(paddingLeft);
      var padRight = numberizePixel(paddingRight);
      var width = numberizePixel(elementWidth);
      var targetCommonWidth, containerTrueWidth; // accommodate for potential inconsistent padding
      // ex. first element vs common element vs last element

      if (padLeft === 0) {
        targetCommonWidth = width + padRight;
        containerTrueWidth = width + ((elementQuantity - 1) * width + padRight);
      } else {
        targetCommonWidth = width - padRight;
        containerTrueWidth = width + ((elementQuantity - 1) * width - padRight);
      }

      return {
        containerTrueWidth: containerTrueWidth,
        targetCommonWidth: targetCommonWidth
      };
    };

    var calculateScrollTarget = function calculateScrollTarget(target, targetContainer) {
      // calculates where the container needs to scroll to center the element in question
      var containerRects = targetContainer.getBoundingClientRect();
      var targetRects = target.getBoundingClientRect();
      var place = target.dataset._ss_;
      var elementQuantity = targetContainer.children.length;

      var _calculateElementWidt = calculateElementWidths(target, elementQuantity),
          containerTrueWidth = _calculateElementWidt.containerTrueWidth,
          targetCommonWidth = _calculateElementWidt.targetCommonWidth;

      var scrollTarget = containerTrueWidth / 2 - containerRects.width / 2 + calculateTrajectory(place, targetCommonWidth, elementQuantity);
      return {
        scrollTarget: scrollTarget,
        containerRects: containerRects,
        targetRects: targetRects
      };
    };

    var _calculateScrollTarge = calculateScrollTarget(el, container),
        targetRects = _calculateScrollTarge.targetRects,
        containerRects = _calculateScrollTarge.containerRects,
        scrollTarget = _calculateScrollTarge.scrollTarget;

    smoothScroll.call(el, container, scrollTarget, container.scrollTop + targetRects.top - containerRects.top);
  }
};

var useSmoothScrollIntoCenter = function useSmoothScrollIntoCenter(selected) {
  var childRef = (0, _react.useRef)(null);
  var containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    smoothScrollIntoCenter(childRef, containerRef);
  }, [selected]);
  return {
    childRef: childRef,
    containerRef: containerRef
  };
};

var SmoothScrollWrapper = function SmoothScrollWrapper(_ref) {
  var children = _ref.children,
      selectedIndex = _ref.selectedIndex;

  var _useSmoothScrollIntoC = useSmoothScrollIntoCenter(selectedIndex),
      childRef = _useSmoothScrollIntoC.childRef,
      containerRef = _useSmoothScrollIntoC.containerRef;

  return /*#__PURE__*/_react["default"].createElement("div", {
    id: "smooth-scroll-container",
    ref: selectedIndex && containerRef
  }, _react.Children.map(children, function (child, i) {
    return /*#__PURE__*/(0, _react.cloneElement)(child, {
      ref: selectedIndex === i ? childRef : null,
      "data-_ss_": i
    });
  }));
};

SmoothScrollWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  selectedIndex: PropTypes.number.isRequired
};

var _default = /*#__PURE__*/(0, _react.memo)(SmoothScrollWrapper);

exports["default"] = _default;