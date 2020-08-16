import React, { Children, cloneElement, memo, useEffect, useRef } from "react";
import "./ss.css";

const smoothScrollIntoCenter = (selectedDayRef, selectedDayContainerRef) => {
  if (
    selectedDayContainerRef?.current?.getBoundingClientRect &&
    selectedDayRef?.current
  ) {
    const el = selectedDayRef.current;
    const container = selectedDayContainerRef.current;
    const ease = (k) => 0.5 * (1 - Math.cos(Math.PI * k));

    // define timing method
    const now =
      window.performance && window.performance.now
        ? window.performance.now.bind(window.performance)
        : Date.now;
    const step = (context) => {
      const time = now();
      const SCROLL_TIME = 468;
      let elapsed = (time - context.startTime) / SCROLL_TIME;
      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;
      // apply easing to elapsed time
      const value = ease(elapsed);
      const currentX = context.startX + (context.x - context.startX) * value;
      const currentY = context.startY + (context.y - context.startY) * value;
      context.scrollElement(context.element, currentX, currentY);
      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        window.requestAnimationFrame(() => step(context));
      }
    };
    const scrollElement = (element, x, y) => {
      element.scrollLeft = x;
      element.scrollTop = y;
    };
    // scroll looping over a frame
    const smoothScroll = (element, x, y) => {
      step({
        element,
        scrollElement,
        startTime: now(),
        startX: element.scrollLeft,
        startY: element.scrollTop,
        x,
        y,
      });
    };
    const numberizePixel = (pixel) => {
      return parseInt(pixel.replace("px", ""), 10);
    };
    const calculateTrajectory = (
      place = "0",
      targetCommonWidth = 80,
      elementQuantity
    ) => {
      // based on the position of selected date
      // and the total amount of dates
      // we will calculate the extra distance needed
      // to accommodate centering selected date
      const middleIndex = Math.floor((elementQuantity - 1) / 2);
      const numberedPlace = parseInt(place, 10);
      const multiple = numberedPlace - middleIndex;
      return targetCommonWidth * multiple;
    };
    const calculateElementWidths = (target, elementQuantity) => {
      const {
        paddingRight,
        paddingLeft,
        width: elementWidth,
      } = window.getComputedStyle(target);
      // used to get the dimensions of the datePickers and the full overflow width of their container
      const padLeft = numberizePixel(paddingLeft);
      const padRight = numberizePixel(paddingRight);
      const width = numberizePixel(elementWidth);
      let targetCommonWidth, containerTrueWidth;
      // accommodate for potential inconsistent padding
      // ex. first element vs common element vs last element
      if (padLeft === 0) {
        targetCommonWidth = width + padRight;
        containerTrueWidth = width + ((elementQuantity - 1) * width + padRight);
      } else {
        targetCommonWidth = width - padRight;
        containerTrueWidth = width + ((elementQuantity - 1) * width - padRight);
      }
      return { containerTrueWidth, targetCommonWidth };
    };
    const calculateScrollTarget = (target, targetContainer) => {
      // calculates where the container needs to scroll to center the element in question
      const containerRects = targetContainer.getBoundingClientRect();
      const targetRects = target.getBoundingClientRect();
      const place = target.dataset._ss_;
      const elementQuantity = targetContainer.children.length;
      const { containerTrueWidth, targetCommonWidth } = calculateElementWidths(
        target,
        elementQuantity
      );
      const scrollTarget =
        containerTrueWidth / 2 -
        containerRects.width / 2 +
        calculateTrajectory(place, targetCommonWidth, elementQuantity);

      return {
        scrollTarget,
        containerRects,
        targetRects,
      };
    };
    const { targetRects, containerRects, scrollTarget } = calculateScrollTarget(
      el,
      container
    );
    smoothScroll.call(
      el,
      container,
      scrollTarget,
      container.scrollTop + targetRects.top - containerRects.top
    );
  }
};

const useSmoothScrollIntoCenter = (selected) => {
  const childRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    smoothScrollIntoCenter(childRef, containerRef);
  }, [selected]);
  return { childRef, containerRef };
};

const SmoothScrollWrapper = ({ children, selectedIndex }) => {
  const { childRef, containerRef } = useSmoothScrollIntoCenter(selectedIndex);

  return (
    <div id={"smooth-scroll-container"} ref={selectedIndex && containerRef}>
      {Children.map(children, (child, i) =>
        cloneElement(child, {
          ref: selectedIndex === i ? childRef : null,
          "data-_ss_": i,
        })
      )}
    </div>
  );
};

SmoothScrollWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  selectedIndex: PropTypes.number.isRequired,
};

export default memo(SmoothScrollWrapper);
