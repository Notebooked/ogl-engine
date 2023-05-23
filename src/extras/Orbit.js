// Based from ThreeJS' OrbitControls class, rewritten using es6 with some additions and subtractions.
// TODO: abstract event handlers so can be fed from other sources
// TODO: make scroll zoom more accurate than just >/< zero
// TODO: be able to pass in new camera position

import { Node } from '../core/Node.js';
import { Camera } from '../core/Camera.js'
import { Vec3 } from '../math/Vec3.js';
import { Vec2 } from '../math/Vec2.js';

const STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, DOLLY_PAN: 3 };
const tempVec3 = new Vec3();
const tempVec2a = new Vec2();
const tempVec2b = new Vec2();

export class Orbit extends Node {
    constructor(
        object,
        {
            element = document,
            enabled = true,
            target = new Vec3(),
            ease = 0.25,
            inertia = 0.85,
            enableRotate = true,
            rotateSpeed = 0.1,
            autoRotate = false,
            autoRotateSpeed = 1.0,
            enableZoom = true,
            zoomSpeed = 1,
            zoomStyle = 'dolly',
            enablePan = true,
            panSpeed = 0.1,
            minPolarAngle = 0,
            maxPolarAngle = Math.PI,
            minAzimuthAngle = -Infinity,
            maxAzimuthAngle = Infinity,
            minDistance = 0,
            maxDistance = Infinity,
        } = {}) {
        super("Orbit");
        this.enabled = enabled;
        this.target = target;
        this.zoomStyle = zoomStyle;

        this.object = object;

        // Catch attempts to disable - set to 1 so has no effect
        this.ease = ease || 1;
        this.inertia = inertia || 0;

        this.minDistance = minDistance;
        this.maxDistance = maxDistance;

        // current position in sphericalTarget coordinates
        this.sphericalDelta = { radius: 1, phi: 0, theta: 0 };
        this.sphericalTarget = { radius: 1, phi: 0, theta: 0 };
        this.spherical = { radius: 1, phi: 0, theta: 0 };
        this.panDelta = new Vec3();

        this.autoRotate = autoRotate;
        this.minAzimuthAngle = minAzimuthAngle;
        this.maxAzimuthAngle = maxAzimuthAngle;
        this.minPolarAngle = minPolarAngle;
        this.maxPolarAngle = maxPolarAngle;

        // Grab initial position values
        this.offset = new Vec3();
        this.offset.copy(object.position).sub(this.target);
        this.spherical.radius = this.sphericalTarget.radius = this.offset.distance();
        this.spherical.theta = this.sphericalTarget.theta = Math.atan2(this.offset.x, this.offset.z);
        this.spherical.phi = this.sphericalTarget.phi = Math.acos(Math.min(Math.max(this.offset.y / this.sphericalTarget.radius, -1), 1));

        // Updates internals with new position
        this.forcePosition = () => {
            this.offset.copy(object.position).sub(this.target);
            this.spherical.radius = this.sphericalTarget.radius = this.offset.distance();
            this.spherical.theta = this.sphericalTarget.theta = Math.atan2(this.offset.x, this.offset.z);
            this.spherical.phi = this.sphericalTarget.phi = Math.acos(Math.min(Math.max(this.offset.y / this.sphericalTarget.radius, -1), 1));
            object.lookAt(this.target);
        };

        // Everything below here just updates panDelta and sphericalDelta
        // Using those two objects' values, the orbit is calculated

        const rotateStart = new Vec2();
        const panStart = new Vec2();
        const dollyStart = new Vec2();

        let state = STATE.NONE;
        this.mouseButtons = { ORBIT: 0, ZOOM: 1, PAN: 2 };

        const getZoomScale = () => {
            return Math.pow(0.95, zoomSpeed);
        }

        const panLeft = (distance, m) => {
            tempVec3.set(m[0], m[1], m[2]);
            tempVec3.multiply(-distance);
            this.panDelta.add(tempVec3);
        }

        const panUp = (distance, m) => {
            tempVec3.set(m[4], m[5], m[6]);
            tempVec3.multiply(distance);
            this.panDelta.add(tempVec3);
        }

        const pan = (deltaX, deltaY) => {
            let el = element === document ? document.body : element;
            tempVec3.copy(object.position).sub(this.target);
            let targetDistance = tempVec3.distance();
            targetDistance *= Math.tan((((object.fov || 45) / 2) * Math.PI) / 180.0);
            panLeft((2 * deltaX * targetDistance) / el.clientHeight, object.matrix);
            panUp((2 * deltaY * targetDistance) / el.clientHeight, object.matrix);
        };

        const dolly = (dollyScale) => {
            if (this.zoomStyle === 'dolly') this.sphericalDelta.radius /= dollyScale;
            else {
                object.fov /= dollyScale;
                if (object.type === 'orthographic') object.orthographic();
                else object.perspective();
            }
        };

        const handleAutoRotate = () => {
            const angle = ((2 * Math.PI) / 60 / 60) * autoRotateSpeed;
            this.sphericalDelta.theta -= angle;
        }

        const handleMoveRotate = (x, y) => {
            tempVec2a.set(x, y);
            tempVec2b.sub(tempVec2a, rotateStart).multiply(rotateSpeed);
            let el = element === document ? document.body : element;
            this.sphericalDelta.theta -= (2 * Math.PI * tempVec2b.x) / el.clientHeight;
            this.sphericalDelta.phi -= (2 * Math.PI * tempVec2b.y) / el.clientHeight;
            rotateStart.copy(tempVec2a);
        }

        const handleMouseMoveDolly = (e) => {
            tempVec2a.set(e.clientX, e.clientY);
            tempVec2b.sub(tempVec2a, dollyStart);
            if (tempVec2b.y > 0) {
                dolly(getZoomScale());
            } else if (tempVec2b.y < 0) {
                dolly(1 / getZoomScale());
            }
            dollyStart.copy(tempVec2a);
        }

        const handleMovePan = (x, y) => {
            tempVec2a.set(x, y);
            tempVec2b.sub(tempVec2a, panStart).multiply(panSpeed);
            pan(tempVec2b.x, tempVec2b.y);
            panStart.copy(tempVec2a);
        }

        const handleTouchStartDollyPan = (e) => {
            if (enableZoom) {
                let dx = e.touches[0].pageX - e.touches[1].pageX;
                let dy = e.touches[0].pageY - e.touches[1].pageY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                dollyStart.set(0, distance);
            }

            if (enablePan) {
                let x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
                let y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
                panStart.set(x, y);
            }
        }

        const handleTouchMoveDollyPan = (e) => {
            if (enableZoom) {
                let dx = e.touches[0].pageX - e.touches[1].pageX;
                let dy = e.touches[0].pageY - e.touches[1].pageY;
                let distance = Math.sqrt(dx * dx + dy * dy);
                tempVec2a.set(0, distance);
                tempVec2b.set(0, Math.pow(tempVec2a.y / dollyStart.y, zoomSpeed));
                dolly(tempVec2b.y);
                dollyStart.copy(tempVec2a);
            }

            if (enablePan) {
                let x = 0.5 * (e.touches[0].pageX + e.touches[1].pageX);
                let y = 0.5 * (e.touches[0].pageY + e.touches[1].pageY);
                handleMovePan(x, y);
            }
        }

        const onMouseDown = (e) => {
            if (!this.enabled) return;

            switch (e.button) {
                case this.mouseButtons.ORBIT:
                    if (enableRotate === false) return;
                    rotateStart.set(e.clientX, e.clientY);
                    state = STATE.ROTATE;
                    break;
                case this.mouseButtons.ZOOM:
                    if (enableZoom === false) return;
                    dollyStart.set(e.clientX, e.clientY);
                    state = STATE.DOLLY;
                    break;
                case this.mouseButtons.PAN:
                    if (enablePan === false) return;
                    panStart.set(e.clientX, e.clientY);
                    state = STATE.PAN;
                    break;
            }

            if (state !== STATE.NONE) {
                window.addEventListener('mousemove', onMouseMove, false);
                window.addEventListener('mouseup', onMouseUp, false);
            }
        };

        const onMouseMove = (e) => {
            if (!this.enabled) return;

            switch (state) {
                case STATE.ROTATE:
                    if (enableRotate === false) return;
                    handleMoveRotate(e.clientX, e.clientY);
                    break;
                case STATE.DOLLY:
                    if (enableZoom === false) return;
                    handleMouseMoveDolly(e);
                    break;
                case STATE.PAN:
                    if (enablePan === false) return;
                    handleMovePan(e.clientX, e.clientY);
                    break;
            }
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove, false);
            window.removeEventListener('mouseup', onMouseUp, false);
            state = STATE.NONE;
        };

        const onMouseWheel = (e) => {
            if (!this.enabled || !enableZoom || (state !== STATE.NONE && state !== STATE.ROTATE)) return;
            e.stopPropagation();
            e.preventDefault();

            if (e.deltaY < 0) {
                dolly(1 / getZoomScale());
            } else if (e.deltaY > 0) {
                dolly(getZoomScale());
            }
        };

        const onTouchStart = (e) => {
            if (!this.enabled) return;
            e.preventDefault();

            switch (e.touches.length) {
                case 1:
                    if (enableRotate === false) return;
                    rotateStart.set(e.touches[0].pageX, e.touches[0].pageY);
                    state = STATE.ROTATE;
                    break;
                case 2:
                    if (enableZoom === false && enablePan === false) return;
                    handleTouchStartDollyPan(e);
                    state = STATE.DOLLY_PAN;
                    break;
                default:
                    state = STATE.NONE;
            }
        };

        const onTouchMove = (e) => {
            if (!this.enabled) return;
            e.preventDefault();
            e.stopPropagation();

            switch (e.touches.length) {
                case 1:
                    if (enableRotate === false) return;
                    handleMoveRotate(e.touches[0].pageX, e.touches[0].pageY);
                    break;
                case 2:
                    if (enableZoom === false && enablePan === false) return;
                    handleTouchMoveDollyPan(e);
                    break;
                default:
                    state = STATE.NONE;
            }
        };

        const onTouchEnd = () => {
            if (!this.enabled) return;
            state = STATE.NONE;
        };

        const onContextMenu = (e) => {
            if (!this.enabled) return;
            e.preventDefault();
        };

        function addHandlers() {
            element.addEventListener('contextmenu', onContextMenu, false);
            element.addEventListener('mousedown', onMouseDown, false);
            element.addEventListener('wheel', onMouseWheel, { passive: false });
            element.addEventListener('touchstart', onTouchStart, { passive: false });
            element.addEventListener('touchend', onTouchEnd, false);
            element.addEventListener('touchmove', onTouchMove, { passive: false });
        }

        this.remove = function () {
            element.removeEventListener('contextmenu', onContextMenu);
            element.removeEventListener('mousedown', onMouseDown);
            element.removeEventListener('wheel', onMouseWheel);
            element.removeEventListener('touchstart', onTouchStart);
            element.removeEventListener('touchend', onTouchEnd);
            element.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        addHandlers();
    }
    update() {
        if (this.autoRotate) {
            handleAutoRotate();
        }

        // apply delta
        this.sphericalTarget.radius *= this.sphericalDelta.radius;
        this.sphericalTarget.theta += this.sphericalDelta.theta;
        this.sphericalTarget.phi += this.sphericalDelta.phi;

        // apply boundaries
        this.sphericalTarget.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.sphericalTarget.theta));
        this.sphericalTarget.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.sphericalTarget.phi));
        this.sphericalTarget.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.sphericalTarget.radius));

        // ease values
        this.spherical.phi += (this.sphericalTarget.phi - this.spherical.phi) * this.ease;
        this.spherical.theta += (this.sphericalTarget.theta - this.spherical.theta) * this.ease;
        this.spherical.radius += (this.sphericalTarget.radius - this.spherical.radius) * this.ease;

        // apply pan to target. As offset is relative to target, it also shifts
        this.target.add(this.panDelta);

        // apply rotation to offset
        let sinPhiRadius = this.spherical.radius * Math.sin(Math.max(0.000001, this.spherical.phi));
        this.offset.x = sinPhiRadius * Math.sin(this.spherical.theta);
        this.offset.y = this.spherical.radius * Math.cos(this.spherical.phi);
        this.offset.z = sinPhiRadius * Math.cos(this.spherical.theta);

        // Apply updated values to parent camera
        let camera = this.parent;
        if (!camera instanceof Camera) throw new Error("Parent of Orbit must be a Camera");
        camera.position.copy(this.target).add(this.offset);
        camera.lookAt(this.target);

        // Apply inertia to values
        this.theta *= this.inertia;
        this.sphericalDelta.phi *= this.inertia;
        this.panDelta.multiply(this.inertia);

        // Reset scale every frame to avoid applying scale multiple times
        this.sphericalDelta.radius = 1;
    }
}