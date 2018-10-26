let re_matrix = /^matrix\((.*), (.*), (.*), (.*), (.*), (.*)\)$/;

let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
let idM = svg.createSVGMatrix();
idM.a = 1; idM.b = 0; idM.c = 0; idM.d = 1; idM.e = 0; idM.f = 0;

//______________________________________________________________________________________________________________________
export let setMatrixCoordToElement = (element: HTMLElement
    , a: number
    , b: number
    , c: number
    , d: number
    , e: number
    , f: number
) => {
    element.style.transform = "matrix(" + a + "," + b + "," + c + "," + d + "," + e + "," + f + ")";
};

//______________________________________________________________________________________________________________________
export let setMatrixToElement = (element: HTMLElement, M: SVGMatrix) => {
    setMatrixCoordToElement(element, M.a, M.b, M.c, M.d, M.e, M.f);
};

//______________________________________________________________________________________________________________________
export let getMatrixFromString = (str: string): SVGMatrix => {
    let res = re_matrix.exec(str)
        , matrix = svg.createSVGMatrix()
        ;
    matrix.a = parseFloat(res[1]) || 1;
    matrix.b = parseFloat(res[2]) || 0;
    matrix.c = parseFloat(res[3]) || 0;
    matrix.d = parseFloat(res[4]) || 1;
    matrix.e = parseFloat(res[5]) || 0;
    matrix.f = parseFloat(res[6]) || 0;

    return matrix;
};


//______________________________________________________________________________________________________________________
export let getPoint = (x: number, y: number): SVGPoint => {
    let point = svg.createSVGPoint();
    point.x = x || 0;
    point.y = y || 0;
    return point;
};

//______________________________________________________________________________________________________________________
export let getMatrixFromElement = (element: Element): SVGMatrix => {
    return getMatrixFromString(window.getComputedStyle(element).transform || "matrix(1,1,1,1,1,1)");
};

//______________________________________________________________________________________________________________________
export let drag = (element: HTMLElement
    , originalMatrix: SVGMatrix
    , Pt_coord_element: SVGPoint
    , Pt_coord_parent: SVGPoint
) => {
    var newMatrix: SVGMatrix = svg.createSVGMatrix();
    newMatrix.a = originalMatrix.a;
    newMatrix.b = originalMatrix.b;
    newMatrix.c = originalMatrix.c;
    newMatrix.d = originalMatrix.d;
    newMatrix.e = Pt_coord_parent.x - originalMatrix.a * Pt_coord_element.x - originalMatrix.c * Pt_coord_element.y;
    newMatrix.f = Pt_coord_parent.y - originalMatrix.b * Pt_coord_element.x - originalMatrix.d * Pt_coord_element.y;
    setMatrixToElement(element, newMatrix);
};

//______________________________________________________________________________________________________________________
export let rotozoom = (element: HTMLElement
    , originalMatrix: SVGMatrix
    , Pt1_coord_element: SVGPoint
    , Pt1_coord_parent: SVGPoint
    , Pt2_coord_element: SVGPoint
    , Pt2_coord_parent: SVGPoint
) => {
    let dxe: number = Pt2_coord_element.x - Pt1_coord_element.x,
        dye: number = Pt2_coord_element.y - Pt1_coord_element.y,
        dxp: number = Pt2_coord_parent.x - Pt1_coord_parent.x,
        dyp: number = Pt2_coord_parent.y - Pt1_coord_parent.y;
    var newMatrix: SVGMatrix = svg.createSVGMatrix();
    if (dxe === 0) { //If the points are equals, we give up
        return;
    }
    if (dxe === 0 && dye !== 0) {
        newMatrix.b = -dxp / dye;
        newMatrix.a = dyp / dye;
    }
    else if (dxe !== 0 && dye === 0) {
        newMatrix.b = dyp / dxe;
        newMatrix.a = dxp / dxe;
    }
    else if (dxe !== 0 && dye !== 0) {
        newMatrix.b = (dyp / dye - dxp / dxe) / (dye / dxe + dxe / dye);
        newMatrix.a = (dyp - newMatrix.b * dxe) / dye;
    }
    newMatrix.e = Pt1_coord_parent.x - newMatrix.a * Pt1_coord_element.x + newMatrix.b * Pt1_coord_element.y;
    newMatrix.f = Pt1_coord_parent.y - newMatrix.b * Pt1_coord_element.x + newMatrix.a * Pt1_coord_element.y;
    newMatrix.c = -newMatrix.b;
    newMatrix.d = newMatrix.a;

    setMatrixToElement(element, newMatrix);
};
