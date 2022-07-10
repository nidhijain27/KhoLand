export class JoystickController{

    private stick: any;
    private dragStart = null;
    private touchId = null;
    private active = false;
    private value = { x: 0, y: 0 }; 
    private maxDistance: number;
    private deadzone: number;

	// maxDistance: maximum amount joystick can move in any direction
	// deadzone: joystick must move at least this amount from origin to register value change
	constructor( _stick:any, _maxDistance:number, _deadzone:number )
	{
		this.stick = _stick;
        this.maxDistance = _maxDistance;
        this.deadzone = _deadzone;

		const self = this;

        function handleDown(event)
        {
            
            self.active = true;

            // all drag movements are instantaneous
            console.log("Stick", self.stick)
            self.stick.style.transition = '0s';

            // touch event fired before mouse event; prevent redundant mouse event from firing
            event.preventDefault();

            if (event.changedTouches)
                self.dragStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
            else
                self.dragStart = { x: event.clientX, y: event.clientY };

            // if this is a touch event, keep track of which one
            if (event.changedTouches)
                self.touchId = event.changedTouches[0].identifier;
        }
    
        function handleMove(event) 
        {
        
            if ( !self.active ) return;

            // if this is a touch event, make sure it is the right one
            // also handle multiple simultaneous touchmove events
            let touchmoveId = null;
            if (event.changedTouches)
            {
                for (let i = 0; i < event.changedTouches.length; i++)
                {
                    if (self.touchId == event.changedTouches[i].identifier)
                    {
                        touchmoveId = i;
                        event.clientX = event.changedTouches[i].clientX;
                        event.clientY = event.changedTouches[i].clientY;
                    }
                }

                if (touchmoveId == null) return;
            }

            const xDiff = event.clientX - self.dragStart.x;
            const yDiff = event.clientY - self.dragStart.y;
            const angle = Math.atan2(yDiff, xDiff);
            const distance = Math.min(self.maxDistance, Math.hypot(xDiff, yDiff));
            const xPosition = distance * Math.cos(angle);
            const yPosition = distance * Math.sin(angle);

            // move stick image to new position
            self.stick.style.transform = `translate3d(${xPosition}px, ${yPosition}px, 0px)`;

            // deadzone adjustment
            const distance2 = (distance < self.deadzone) ? 0 : self.maxDistance / (self.maxDistance - self.deadzone) * (distance - self.deadzone);
            const xPosition2 = distance2 * Math.cos(angle);
            const yPosition2 = distance2 * Math.sin(angle);
            const xPercent = parseFloat((xPosition2 / self.maxDistance).toFixed(4));
            const yPercent = parseFloat((yPosition2 / self.maxDistance).toFixed(4));
            
            self.value = { x: xPercent, y: yPercent };
        }

        function handleUp(event) 
        {

            

           if ( !self.active ) return;

           // if this is a touch event, make sure it is the right one
           if (event.changedTouches && self.touchId != event.changedTouches[0].identifier) return;

           // transition the joystick position back to center
           self.stick.style.transition = '.2s';
           self.stick.style.transform = `translate3d(0px, 0px, 0px)`;

           // reset everything
           self.value = { x: 0, y: 0 };
           self.touchId = null;
           self.active = false;
       }

		self.stick.addEventListener('mousedown', handleDown);
		self.stick.addEventListener('touchstart',handleDown);
		document.addEventListener('mousemove', handleMove, {passive: false});
		document.addEventListener('touchmove', handleMove, {passive: false});
		document.addEventListener('mouseup', handleUp);
		document.addEventListener('touchend', handleUp);
	}

    

    get Value(){
        return this.value;
    }

    get Object(){
        return this.stick;
    }

}