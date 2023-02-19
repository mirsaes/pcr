import { ReactNode } from "react";

export enum SwipeDirection
{
    LEFT= 0,
    RIGHT= 1,
    UP=2,
    DOWN=3
};

type SwipeableProps = {onSwipe: (swipeInfo: OnSwipeInfo) => void} & { children?: ReactNode};

export type OnSwipeInfo = {
	direction: SwipeDirection;
	deltaX: number;
	deltaY: number;
};

export default function Swipeable({children, onSwipe} : SwipeableProps) 
{
	const pointStart: {x: null|number, y: null|number} = {x:null, y:null};

    const constrainToBoundingBox = true;

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		console.log(`mousedown`);
		pointStart.x = e.clientX;
		pointStart.y = e.clientY;
        console.log(`pointStart x=${pointStart.x},y=${pointStart.y}`);
	}

	const handleMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (constrainToBoundingBox)
        {
            let swipeRect = e.currentTarget.getBoundingClientRect();
            if (e.clientX < swipeRect.left || e.clientX > swipeRect.right ||
                e.clientY < swipeRect.top || e.clientY > swipeRect.bottom) {
                    console.log('out of bounds, ignoring mouse swipe');
                    return;
            }
        }

		if (pointStart.x != null && pointStart.y != null) {
			const deltaX = e.clientX - pointStart.x;
			const deltaY = e.clientY - pointStart.y;

			pointStart.x = null;
			pointStart.y = null;
			const direction = (Math.abs(deltaX) > Math.abs(deltaY)?(deltaX<0?SwipeDirection.LEFT:SwipeDirection.RIGHT):(deltaY < 0?SwipeDirection.UP:SwipeDirection.DOWN));
			onSwipe({direction: direction, deltaX: deltaX, deltaY: deltaY});	
		}
	}


	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		if (e.changedTouches.length != 1)
			return;
		const touch = e.changedTouches[0];
		pointStart.x = touch.clientX;
		pointStart.y = touch.clientY;
	}
	const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
		if (e.changedTouches.length != 1)
			return;
		if (!e.currentTarget.classList.contains('swipe-area'))
			return;
		let swipeRect = e.currentTarget.getBoundingClientRect();


		const touch = e.changedTouches[0];
		if (touch.clientX < swipeRect.left || touch.clientX > swipeRect.right ||
			touch.clientY < swipeRect.top || touch.clientY > swipeRect.bottom) {
				console.log('out of bounds, ignoring swipe');
				return;
		}

		if (pointStart.x !== null && pointStart.y !== null) {
			const deltaX = touch.clientX - pointStart.x;
			const deltaY = touch.clientY - pointStart.y;
			pointStart.x = null;
			pointStart.y = null;
	
	
			const direction = (Math.abs(deltaX) > Math.abs(deltaY)?(deltaX<0?SwipeDirection.LEFT:SwipeDirection.RIGHT):(deltaY < 0?SwipeDirection.UP:SwipeDirection.DOWN));
			onSwipe({direction: direction, deltaX: deltaX, deltaY: deltaY});	
		}
	}

    return (
        <>
        <div className="swipe-area" 
					onMouseDown={(e) => handleMouseDown(e)} 
					onMouseUp={(e) => handleMouseUp(e)} 
					onTouchStart={(e) => handleTouchStart(e)}
					onTouchEnd={(e) => handleTouchEnd(e)}					
        >
            {children}
        </div>
            
        </>
    );
}