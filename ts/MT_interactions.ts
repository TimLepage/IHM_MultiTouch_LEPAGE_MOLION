import { FSM } from "./FSM";
import * as transfo from "./transfo";

function multiTouch(element: HTMLElement): void {
    let pointerId_1: number, Pt1_coord_element: SVGPoint, Pt1_coord_parent: SVGPoint,
        pointerId_2: number, Pt2_coord_element: SVGPoint, Pt2_coord_parent: SVGPoint,
        originalMatrix: SVGMatrix,
        getRelevantDataFromEvent = (evt: TouchEvent): Touch => {
            for (let i = 0; i < evt.changedTouches.length; i++) {
                let touch = evt.changedTouches.item(i);
                if (touch.identifier === pointerId_1 || touch.identifier === pointerId_2) {
                    return touch;
                }
            }
            return null;
        };
    enum MT_STATES { Inactive, Translating, Rotozooming }
    let fsm = FSM.parse<MT_STATES>({
        initialState: MT_STATES.Inactive,
        states: [MT_STATES.Inactive, MT_STATES.Translating, MT_STATES.Rotozooming],
        transitions: [
            {
                from: MT_STATES.Inactive, to: MT_STATES.Translating,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt: TouchEvent): boolean => {

                    pointerId_1 = 0;
                    pointerId_2 = 1;
                    let newTouch: Touch = getRelevantDataFromEvent(evt);

                    originalMatrix = transfo.getMatrixFromElement(element);

                    // Multiplication of matrix point is done via matrixTransform (wtf?) : https://developer.mozilla.org/en-US/docs/Web/API/SVGPoint
                    Pt1_coord_element = transfo.getPoint(newTouch.pageX, newTouch.pageY).matrixTransform(originalMatrix.inverse());
                    Pt1_coord_parent = transfo.getPoint(newTouch.pageX, newTouch.pageY);

                    console.log("inactive to translating done");
                    return true;
                }
            },
            {
                from: MT_STATES.Translating, to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();

                    let newTouch: Touch = getRelevantDataFromEvent(evt);

                    var parentPoint: SVGPoint = transfo.getPoint(newTouch.pageX, newTouch.pageY);

                    transfo.drag(element, originalMatrix, Pt1_coord_element, parentPoint);
                    console.log("touchmove done");

                    return true;
                }
            },
            {
                from: MT_STATES.Translating,
                to: MT_STATES.Inactive,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    return true;
                }
            },
            {
                from: MT_STATES.Translating, to: MT_STATES.Rotozooming,
                eventTargets: [element],
                eventName: ["touchstart"],
                useCapture: false,
                action: (evt: TouchEvent): boolean => {
                    console.log(getRelevantDataFromEvent(evt));

                    originalMatrix = transfo.getMatrixFromElement(element);

                    let newTouch: Touch = getRelevantDataFromEvent(evt);

                    // Multiplication of matrix point is done via matrixTransform (wtf?) : https://developer.mozilla.org/en-US/docs/Web/API/SVGPoint
                    Pt2_coord_element = transfo.getPoint(newTouch.pageX, newTouch.pageY).matrixTransform(originalMatrix.inverse());
                    Pt2_coord_parent = transfo.getPoint(newTouch.pageX, newTouch.pageY);

                    console.log("translating to rotozooming done");
                    return true;
                }
            },
            {
                from: MT_STATES.Rotozooming, to: MT_STATES.Rotozooming,
                eventTargets: [document],
                eventName: ["touchmove"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {
                    evt.preventDefault();
                    evt.stopPropagation();

                    let newTouch: Touch = getRelevantDataFromEvent(evt);

                    if (newTouch.identifier === pointerId_1) {
                        Pt1_coord_parent = transfo.getPoint(newTouch.pageX, newTouch.pageY);
                    }
                    if (newTouch.identifier === pointerId_2) {
                        Pt2_coord_parent = transfo.getPoint(newTouch.pageX, newTouch.pageY);
                    }

                    transfo.rotozoom(element, originalMatrix, Pt1_coord_element, Pt1_coord_parent, Pt2_coord_element, Pt2_coord_parent);

                    return true;
                }
            },
            {
                from: MT_STATES.Rotozooming, to: MT_STATES.Translating,
                eventTargets: [document],
                eventName: ["touchend"],
                useCapture: true,
                action: (evt: TouchEvent): boolean => {

                    originalMatrix = transfo.getMatrixFromElement(element);

                    let remainingTouch: Touch = getRelevantDataFromEvent(evt);

                    // Multiplication of matrix point is done via matrixTransform (wtf?) : https://developer.mozilla.org/en-US/docs/Web/API/SVGPoint
                    Pt1_coord_element = transfo.getPoint(remainingTouch.pageX, remainingTouch.pageY).matrixTransform(originalMatrix.inverse());
                    Pt1_coord_parent = transfo.getPoint(remainingTouch.pageX, remainingTouch.pageY);

                    return true;
                }
            }
        ]
    });
    fsm.start();
}

//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
//______________________________________________________________________________________________________________________
function isString(s: any): boolean {
    return typeof (s) === "string" || s instanceof String;
}

export let $ = (sel: string | Element | Element[]): void => {
    let L: Element[] = [];
    if (isString(sel)) {
        L = Array.from(document.querySelectorAll(<string> sel));
    } else if (sel instanceof Element) {
        L.push(sel);
    } else if (sel instanceof Array) {
        L = sel;
    }
    L.forEach(multiTouch);
};
