// Generated from the upstream declarations. See README.md and the included license.
declare enum MOUSE {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    ROTATE = 0,
    DOLLY = 1,
    PAN = 2
}
declare enum TOUCH {
    ROTATE = 0,
    PAN = 1,
    DOLLY_PAN = 2,
    DOLLY_ROTATE = 3
}
declare const CullFaceNone: 0;
declare const CullFaceBack: 1;
declare const CullFaceFront: 2;
declare const CullFaceFrontBack: 3;
export type CullFace = typeof CullFaceNone | typeof CullFaceBack | typeof CullFaceFront | typeof CullFaceFrontBack;
declare const BasicShadowMap: 0;
declare const PCFShadowMap: 1;
declare const PCFSoftShadowMap: 2;
declare const VSMShadowMap: 3;
export type ShadowMapType = typeof BasicShadowMap | typeof PCFShadowMap | typeof PCFSoftShadowMap | typeof VSMShadowMap;
declare const FrontSide: 0;
export const BackSide: 1;
export const DoubleSide: 2;
export type Side = typeof FrontSide | typeof BackSide | typeof DoubleSide;
declare const NoBlending: 0;
declare const NormalBlending: 1;
declare const AdditiveBlending: 2;
declare const SubtractiveBlending: 3;
declare const MultiplyBlending: 4;
declare const CustomBlending: 5;
declare const MaterialBlending: 6;
export type Blending = typeof NoBlending | typeof NormalBlending | typeof AdditiveBlending | typeof SubtractiveBlending | typeof MultiplyBlending | typeof CustomBlending | typeof MaterialBlending;
declare const AddEquation: 100;
declare const SubtractEquation: 101;
declare const ReverseSubtractEquation: 102;
declare const MinEquation: 103;
declare const MaxEquation: 104;
export type BlendingEquation = typeof AddEquation | typeof SubtractEquation | typeof ReverseSubtractEquation | typeof MinEquation | typeof MaxEquation;
declare const ZeroFactor: 200;
declare const OneFactor: 201;
declare const SrcColorFactor: 202;
declare const OneMinusSrcColorFactor: 203;
declare const SrcAlphaFactor: 204;
declare const OneMinusSrcAlphaFactor: 205;
declare const DstAlphaFactor: 206;
declare const OneMinusDstAlphaFactor: 207;
declare const DstColorFactor: 208;
declare const OneMinusDstColorFactor: 209;
declare const SrcAlphaSaturateFactor: 210;
declare const ConstantColorFactor: 211;
declare const OneMinusConstantColorFactor: 212;
declare const ConstantAlphaFactor: 213;
declare const OneMinusConstantAlphaFactor: 214;
export type BlendingDstFactor = typeof ZeroFactor | typeof OneFactor | typeof SrcColorFactor | typeof OneMinusSrcColorFactor | typeof SrcAlphaFactor | typeof OneMinusSrcAlphaFactor | typeof DstAlphaFactor | typeof OneMinusDstAlphaFactor | typeof DstColorFactor | typeof OneMinusDstColorFactor | typeof ConstantColorFactor | typeof OneMinusConstantColorFactor | typeof ConstantAlphaFactor | typeof OneMinusConstantAlphaFactor;
export type BlendingSrcFactor = BlendingDstFactor | typeof SrcAlphaSaturateFactor;
declare const NeverDepth: 0;
declare const AlwaysDepth: 1;
declare const LessDepth: 2;
declare const LessEqualDepth: 3;
declare const EqualDepth: 4;
declare const GreaterEqualDepth: 5;
declare const GreaterDepth: 6;
declare const NotEqualDepth: 7;
export type DepthModes = typeof NeverDepth | typeof AlwaysDepth | typeof LessDepth | typeof LessEqualDepth | typeof EqualDepth | typeof GreaterEqualDepth | typeof GreaterDepth | typeof NotEqualDepth;
declare const MultiplyOperation: 0;
declare const MixOperation: 1;
declare const AddOperation: 2;
export type Combine = typeof MultiplyOperation | typeof MixOperation | typeof AddOperation;
declare const NoToneMapping: 0;
declare const LinearToneMapping: 1;
declare const ReinhardToneMapping: 2;
declare const CineonToneMapping: 3;
declare const ACESFilmicToneMapping: 4;
declare const CustomToneMapping: 5;
declare const AgXToneMapping: 6;
declare const NeutralToneMapping: 7;
export type ToneMapping = typeof NoToneMapping | typeof LinearToneMapping | typeof ReinhardToneMapping | typeof CineonToneMapping | typeof ACESFilmicToneMapping | typeof CustomToneMapping | typeof AgXToneMapping | typeof NeutralToneMapping;
declare const UVMapping: 300;
declare const CubeReflectionMapping: 301;
declare const CubeRefractionMapping: 302;
declare const EquirectangularReflectionMapping: 303;
declare const EquirectangularRefractionMapping: 304;
export type Mapping = typeof UVMapping | typeof EquirectangularReflectionMapping | typeof EquirectangularRefractionMapping;
export type CubeTextureMapping = typeof CubeReflectionMapping | typeof CubeRefractionMapping;
export type AnyMapping = Mapping | CubeTextureMapping;
declare const RepeatWrapping: 1000;
declare const ClampToEdgeWrapping: 1001;
declare const MirroredRepeatWrapping: 1002;
export type Wrapping = typeof RepeatWrapping | typeof ClampToEdgeWrapping | typeof MirroredRepeatWrapping;
declare const NearestFilter: 1003;
declare const NearestMipmapNearestFilter: 1004;
declare const NearestMipMapNearestFilter: 1004;
declare const NearestMipmapLinearFilter: 1005;
declare const NearestMipMapLinearFilter: 1005;
declare const LinearFilter: 1006;
declare const LinearMipmapNearestFilter: 1007;
declare const LinearMipMapNearestFilter: 1007;
declare const LinearMipmapLinearFilter: 1008;
declare const LinearMipMapLinearFilter: 1008;
export type MagnificationTextureFilter = typeof NearestFilter | typeof LinearFilter;
export type MinificationTextureFilter = typeof NearestFilter | typeof NearestMipmapNearestFilter | typeof NearestMipMapNearestFilter | typeof NearestMipmapLinearFilter | typeof NearestMipMapLinearFilter | typeof LinearFilter | typeof LinearMipmapNearestFilter | typeof LinearMipMapNearestFilter | typeof LinearMipmapLinearFilter | typeof LinearMipMapLinearFilter;
declare const UnsignedByteType: 1009;
declare const ByteType: 1010;
declare const ShortType: 1011;
declare const UnsignedShortType: 1012;
declare const IntType: 1013;
declare const UnsignedIntType: 1014;
declare const FloatType: 1015;
declare const HalfFloatType: 1016;
declare const UnsignedShort4444Type: 1017;
declare const UnsignedShort5551Type: 1018;
declare const UnsignedInt248Type: 1020;
declare const UnsignedInt5999Type: 35902;
declare const UnsignedInt101111Type: 35899;
export type AttributeGPUType = typeof FloatType | typeof IntType;
export type TextureDataType = typeof UnsignedByteType | typeof ByteType | typeof ShortType | typeof UnsignedShortType | typeof IntType | typeof UnsignedIntType | typeof FloatType | typeof HalfFloatType | typeof UnsignedShort4444Type | typeof UnsignedShort5551Type | typeof UnsignedInt248Type | typeof UnsignedInt5999Type | typeof UnsignedInt101111Type;
declare const AlphaFormat: 1021;
declare const RGBFormat: 1022;
declare const RGBAFormat: 1023;
declare const DepthFormat: 1026;
declare const DepthStencilFormat: 1027;
declare const RedFormat: 1028;
declare const RedIntegerFormat: 1029;
declare const RGFormat: 1030;
declare const RGIntegerFormat: 1031;
declare const RGBIntegerFormat: 1032;
declare const RGBAIntegerFormat: 1033;
export type PixelFormat = typeof AlphaFormat | typeof RGBFormat | typeof RGBAFormat | typeof DepthFormat | typeof DepthStencilFormat | typeof RedFormat | typeof RedIntegerFormat | typeof RGFormat | typeof RGIntegerFormat | typeof RGBIntegerFormat | typeof RGBAIntegerFormat;
export type DepthTexturePixelFormat = typeof DepthFormat | typeof DepthStencilFormat;
declare const RGB_S3TC_DXT1_Format: 33776;
declare const RGBA_S3TC_DXT1_Format: 33777;
declare const RGBA_S3TC_DXT3_Format: 33778;
declare const RGBA_S3TC_DXT5_Format: 33779;
declare const RGB_PVRTC_4BPPV1_Format: 35840;
declare const RGB_PVRTC_2BPPV1_Format: 35841;
declare const RGBA_PVRTC_4BPPV1_Format: 35842;
declare const RGBA_PVRTC_2BPPV1_Format: 35843;
declare const RGB_ETC1_Format: 36196;
declare const RGB_ETC2_Format: 37492;
declare const RGBA_ETC2_EAC_Format: 37496;
declare const R11_EAC_Format: 37488;
declare const SIGNED_R11_EAC_Format: 37489;
declare const RG11_EAC_Format: 37490;
declare const SIGNED_RG11_EAC_Format: 37491;
declare const RGBA_ASTC_4x4_Format: 37808;
declare const RGBA_ASTC_5x4_Format: 37809;
declare const RGBA_ASTC_5x5_Format: 37810;
declare const RGBA_ASTC_6x5_Format: 37811;
declare const RGBA_ASTC_6x6_Format: 37812;
declare const RGBA_ASTC_8x5_Format: 37813;
declare const RGBA_ASTC_8x6_Format: 37814;
declare const RGBA_ASTC_8x8_Format: 37815;
declare const RGBA_ASTC_10x5_Format: 37816;
declare const RGBA_ASTC_10x6_Format: 37817;
declare const RGBA_ASTC_10x8_Format: 37818;
declare const RGBA_ASTC_10x10_Format: 37819;
declare const RGBA_ASTC_12x10_Format: 37820;
declare const RGBA_ASTC_12x12_Format: 37821;
declare const RGBA_BPTC_Format: 36492;
declare const RGB_BPTC_SIGNED_Format = 36494;
declare const RGB_BPTC_UNSIGNED_Format = 36495;
declare const RED_RGTC1_Format: 36283;
declare const SIGNED_RED_RGTC1_Format: 36284;
declare const RED_GREEN_RGTC2_Format: 36285;
declare const SIGNED_RED_GREEN_RGTC2_Format: 36286;
export type CompressedPixelFormat = typeof RGB_S3TC_DXT1_Format | typeof RGBA_S3TC_DXT1_Format | typeof RGBA_S3TC_DXT3_Format | typeof RGBA_S3TC_DXT5_Format | typeof RGB_PVRTC_4BPPV1_Format | typeof RGB_PVRTC_2BPPV1_Format | typeof RGBA_PVRTC_4BPPV1_Format | typeof RGBA_PVRTC_2BPPV1_Format | typeof RGB_ETC1_Format | typeof RGB_ETC2_Format | typeof RGBA_ETC2_EAC_Format | typeof R11_EAC_Format | typeof SIGNED_R11_EAC_Format | typeof RG11_EAC_Format | typeof SIGNED_RG11_EAC_Format | typeof RGBA_ASTC_4x4_Format | typeof RGBA_ASTC_5x4_Format | typeof RGBA_ASTC_5x5_Format | typeof RGBA_ASTC_6x5_Format | typeof RGBA_ASTC_6x6_Format | typeof RGBA_ASTC_8x5_Format | typeof RGBA_ASTC_8x6_Format | typeof RGBA_ASTC_8x8_Format | typeof RGBA_ASTC_10x5_Format | typeof RGBA_ASTC_10x6_Format | typeof RGBA_ASTC_10x8_Format | typeof RGBA_ASTC_10x10_Format | typeof RGBA_ASTC_12x10_Format | typeof RGBA_ASTC_12x12_Format | typeof RGBA_BPTC_Format | typeof RGB_BPTC_SIGNED_Format | typeof RGB_BPTC_UNSIGNED_Format | typeof RED_RGTC1_Format | typeof SIGNED_RED_RGTC1_Format | typeof RED_GREEN_RGTC2_Format | typeof SIGNED_RED_GREEN_RGTC2_Format;
export type AnyPixelFormat = PixelFormat | DepthTexturePixelFormat | CompressedPixelFormat;
declare const InterpolateDiscrete: 2300;
declare const InterpolateLinear: 2301;
declare const InterpolateSmooth: 2302;
declare const InterpolateBezier: 2303;
export type InterpolationModes = typeof InterpolateDiscrete | typeof InterpolateLinear | typeof InterpolateSmooth | typeof InterpolateBezier;
declare const ZeroCurvatureEnding: 2400;
declare const ZeroSlopeEnding: 2401;
declare const WrapAroundEnding: 2402;
export type InterpolationEndingModes = typeof ZeroCurvatureEnding | typeof ZeroSlopeEnding | typeof WrapAroundEnding;
declare const NormalAnimationBlendMode: 2500;
declare const AdditiveAnimationBlendMode: 2501;
export type AnimationBlendMode = typeof NormalAnimationBlendMode | typeof AdditiveAnimationBlendMode;
declare const BasicDepthPacking: 3200;
declare const RGBADepthPacking: 3201;
declare const RGBDepthPacking: 3202;
declare const RGDepthPacking: 3203;
export type DepthPackingStrategies = typeof BasicDepthPacking | typeof RGBADepthPacking | typeof RGBDepthPacking | typeof RGDepthPacking;
declare const TangentSpaceNormalMap: 0;
declare const ObjectSpaceNormalMap: 1;
export type NormalMapTypes = typeof TangentSpaceNormalMap | typeof ObjectSpaceNormalMap;
declare const NoColorSpace: "";
export const SRGBColorSpace: "srgb";
declare const LinearSRGBColorSpace: "srgb-linear";
export type ColorSpace = typeof NoColorSpace | typeof SRGBColorSpace | typeof LinearSRGBColorSpace;
declare const ZeroStencilOp: 0;
declare const KeepStencilOp: 7680;
declare const ReplaceStencilOp: 7681;
declare const IncrementStencilOp: 7682;
declare const DecrementStencilOp: 7283;
declare const IncrementWrapStencilOp: 34055;
declare const DecrementWrapStencilOp: 34056;
declare const InvertStencilOp: 5386;
export type StencilOp = typeof ZeroStencilOp | typeof KeepStencilOp | typeof ReplaceStencilOp | typeof IncrementStencilOp | typeof DecrementStencilOp | typeof IncrementWrapStencilOp | typeof DecrementWrapStencilOp | typeof InvertStencilOp;
declare const NeverStencilFunc: 512;
declare const LessStencilFunc: 513;
declare const EqualStencilFunc: 514;
declare const LessEqualStencilFunc: 515;
declare const GreaterStencilFunc: 516;
declare const NotEqualStencilFunc: 517;
declare const GreaterEqualStencilFunc: 518;
declare const AlwaysStencilFunc: 519;
export type StencilFunc = typeof NeverStencilFunc | typeof LessStencilFunc | typeof EqualStencilFunc | typeof LessEqualStencilFunc | typeof GreaterStencilFunc | typeof NotEqualStencilFunc | typeof GreaterEqualStencilFunc | typeof AlwaysStencilFunc;
declare const NeverCompare: 512;
declare const LessCompare: 513;
declare const EqualCompare: 514;
declare const LessEqualCompare: 515;
declare const GreaterCompare: 516;
declare const NotEqualCompare: 517;
declare const GreaterEqualCompare: 518;
declare const AlwaysCompare: 519;
export type TextureComparisonFunction = typeof NeverCompare | typeof LessCompare | typeof EqualCompare | typeof LessEqualCompare | typeof GreaterCompare | typeof NotEqualCompare | typeof GreaterEqualCompare | typeof AlwaysCompare;
declare const StaticDrawUsage: 35044;
declare const DynamicDrawUsage: 35048;
declare const StreamDrawUsage: 35040;
declare const StaticReadUsage: 35045;
declare const DynamicReadUsage: 35049;
declare const StreamReadUsage: 35041;
declare const StaticCopyUsage: 35046;
declare const DynamicCopyUsage: 35050;
declare const StreamCopyUsage: 35042;
export type Usage = typeof StaticDrawUsage | typeof DynamicDrawUsage | typeof StreamDrawUsage | typeof StaticReadUsage | typeof DynamicReadUsage | typeof StreamReadUsage | typeof StaticCopyUsage | typeof DynamicCopyUsage | typeof StreamCopyUsage;
declare const GLSL1: "100";
declare const GLSL3: "300 es";
export type GLSLVersion = typeof GLSL1 | typeof GLSL3;
declare const WebGLCoordinateSystem: 2000;
declare const WebGPUCoordinateSystem: 2001;
export type CoordinateSystem = typeof WebGLCoordinateSystem | typeof WebGPUCoordinateSystem;
declare const TimestampQuery: {
    COMPUTE: "compute";
    RENDER: "render";
};
export type TimestampQuery = typeof TimestampQuery.COMPUTE | typeof TimestampQuery.RENDER;
declare const InterpolationSamplingType: {
    PERSPECTIVE: "perspective";
    LINEAR: "linear";
    FLAT: "flat";
};
export type InterpolationSamplingType = typeof InterpolationSamplingType.PERSPECTIVE | typeof InterpolationSamplingType.LINEAR | typeof InterpolationSamplingType.FLAT;
declare const InterpolationSamplingMode: {
    NORMAL: "normal";
    CENTROID: "centroid";
    SAMPLE: "sample";
    FIRST: "first";
    EITHER: "either";
};
export type InterpolationSamplingMode = typeof InterpolationSamplingMode.NORMAL | typeof InterpolationSamplingMode.CENTROID | typeof InterpolationSamplingMode.SAMPLE | typeof InterpolationSamplingMode.FIRST | typeof InterpolationSamplingMode.EITHER;
export type PixelFormatGPU = "ALPHA" | "RGB" | "RGBA" | "LUMINANCE" | "LUMINANCE_ALPHA" | "RED_INTEGER" | "R8" | "R8_SNORM" | "R8I" | "R8UI" | "R16I" | "R16UI" | "R16F" | "R32I" | "R32UI" | "R32F" | "RG8" | "RG8_SNORM" | "RG8I" | "RG8UI" | "RG16I" | "RG16UI" | "RG16F" | "RG32I" | "RG32UI" | "RG32F" | "RGB565" | "RGB8" | "RGB8_SNORM" | "RGB8I" | "RGB8UI" | "RGB16I" | "RGB16UI" | "RGB16F" | "RGB32I" | "RGB32UI" | "RGB32F" | "RGB9_E5" | "SRGB8" | "R11F_G11F_B10F" | "RGBA4" | "RGBA8" | "RGBA8_SNORM" | "RGBA8I" | "RGBA8UI" | "RGBA16I" | "RGBA16UI" | "RGBA16F" | "RGBA32I" | "RGBA32UI" | "RGBA32F" | "RGB5_A1" | "RGB10_A2" | "RGB10_A2UI" | "SRGB8_ALPHA8" | "SRGB8" | "DEPTH_COMPONENT16" | "DEPTH_COMPONENT24" | "DEPTH_COMPONENT32F" | "DEPTH24_STENCIL8" | "DEPTH32F_STENCIL8";
export type Vector2Tuple = [
    x: number,
    y: number
];
export interface Vector2Like {
    readonly x: number;
    readonly y: number;
}
export class Vector2 {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    width: number;
    height: number;
    readonly isVector2: true;
    set(x: number, y: number): this;
    setScalar(scalar: number): this;
    setX(x: number): this;
    setY(y: number): this;
    setComponent(index: number, value: number): this;
    getComponent(index: number): number;
    clone(): this;
    copy(v: Vector2Like): this;
    add(v: Vector2Like): this;
    addScalar(s: number): this;
    addVectors(a: Vector2Like, b: Vector2Like): this;
    addScaledVector(v: Vector2Like, s: number): this;
    sub(v: Vector2Like): this;
    subScalar(s: number): this;
    subVectors(a: Vector2Like, b: Vector2Like): this;
    multiply(v: Vector2Like): this;
    multiplyScalar(scalar: number): this;
    divide(v: Vector2Like): this;
    divideScalar(s: number): this;
    applyMatrix3(m: Matrix3): this;
    min(v: Vector2Like): this;
    max(v: Vector2Like): this;
    clamp(min: Vector2Like, max: Vector2Like): this;
    clampScalar(min: number, max: number): this;
    clampLength(min: number, max: number): this;
    floor(): this;
    ceil(): this;
    round(): this;
    roundToZero(): this;
    negate(): this;
    dot(v: Vector2Like): number;
    cross(v: Vector2Like): number;
    lengthSq(): number;
    length(): number;
    manhattanLength(): number;
    normalize(): this;
    angle(): number;
    angleTo(v: Vector2): number;
    distanceTo(v: Vector2Like): number;
    distanceToSquared(v: Vector2Like): number;
    manhattanDistanceTo(v: Vector2Like): number;
    setLength(length: number): this;
    lerp(v: Vector2Like, alpha: number): this;
    lerpVectors(v1: Vector2Like, v2: Vector2Like, alpha: number): this;
    equals(v: Vector2Like): boolean;
    fromArray(array: number[] | ArrayLike<number>, offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
    toArray(array?: Vector2Tuple, offset?: 0): Vector2Tuple;
    toArray(array: ArrayLike<number>, offset?: number): ArrayLike<number>;
    fromBufferAttribute(attribute: BufferAttribute, index: number): this;
    rotateAround(center: Vector2Like, angle: number): this;
    random(): this;
    [Symbol.iterator](): Iterator<number>;
}
export type Matrix3Tuple = [
    n11: number,
    n12: number,
    n13: number,
    n21: number,
    n22: number,
    n23: number,
    n31: number,
    n32: number,
    n33: number
];
declare class Matrix3 {
    readonly isMatrix3: true;
    elements: Matrix3Tuple;
    constructor();
    constructor(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number);
    set(n11: number, n12: number, n13: number, n21: number, n22: number, n23: number, n31: number, n32: number, n33: number): Matrix3;
    identity(): this;
    copy(m: Matrix3): this;
    extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): this;
    setFromMatrix4(m: Matrix4): Matrix3;
    multiply(m: Matrix3): this;
    premultiply(m: Matrix3): this;
    multiplyMatrices(a: Matrix3, b: Matrix3): this;
    multiplyScalar(s: number): this;
    determinant(): number;
    invert(): this;
    transpose(): this;
    getNormalMatrix(matrix4: Matrix4): this;
    transposeIntoArray(r: number[]): this;
    setUvTransform(tx: number, ty: number, sx: number, sy: number, rotation: number, cx: number, cy: number): this;
    scale(sx: number, sy: number): this;
    rotate(theta: number): this;
    translate(tx: number, ty: number): this;
    makeTranslation(v: Vector2): this;
    makeTranslation(x: number, y: number): this;
    makeRotation(theta: number): this;
    makeScale(x: number, y: number): this;
    equals(matrix: Matrix3): boolean;
    fromArray(array: ArrayLike<number>, offset?: number): this;
    toArray(): Matrix3Tuple;
    toArray<TArray extends ArrayLike<number>>(array: TArray, offset?: number): TArray;
    clone(): this;
}
export interface BaseEvent<TEventType extends string = string> {
    readonly type: TEventType;
}
interface Event$1<TEventType extends string = string, TTarget = unknown> {
    readonly type: TEventType;
    readonly target: TTarget;
}
type EventListener$1<TEventData, TEventType extends string, TTarget> = (event: TEventData & Event$1<TEventType, TTarget>) => void;
declare class EventDispatcher<TEventMap extends {} = {}> {
    constructor();
    addEventListener<T extends Extract<keyof TEventMap, string>>(type: T, listener: EventListener$1<TEventMap[T], T, this>): void;
    hasEventListener<T extends Extract<keyof TEventMap, string>>(type: T, listener: EventListener$1<TEventMap[T], T, this>): boolean;
    removeEventListener<T extends Extract<keyof TEventMap, string>>(type: T, listener: EventListener$1<TEventMap[T], T, this>): void;
    dispatchEvent<T extends Extract<keyof TEventMap, string>>(event: BaseEvent<T> & TEventMap[T]): void;
}
export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;
export type TypedArrayConstructor = Int8ArrayConstructor | Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor | Float64ArrayConstructor;
export interface BufferAttributeJSON {
    itemSize: number;
    type: string;
    array: number[];
    normalized: boolean;
    name?: string;
    usage?: Usage;
}
export interface BufferAttributeEventMap {
    dispose: {};
}
export class BufferAttribute<TEventMap extends BufferAttributeEventMap = BufferAttributeEventMap> extends EventDispatcher<TEventMap> {
    constructor(array: TypedArray, itemSize: number, normalized?: boolean);
    readonly id: number;
    name: string;
    array: TypedArray;
    itemSize: number;
    usage: Usage;
    gpuType: AttributeGPUType;
    updateRanges: Array<{
        start: number;
        count: number;
    }>;
    version: number;
    normalized: boolean;
    readonly count: number;
    set needsUpdate(value: boolean);
    readonly isBufferAttribute: true;
    onUploadCallback: () => void;
    onUpload(callback: () => void): this;
    setUsage(usage: Usage): this;
    addUpdateRange(start: number, count: number): void;
    clearUpdateRanges(): void;
    clone(): BufferAttribute;
    copy(source: BufferAttribute): this;
    copyAt(index1: number, attribute: BufferAttribute, index2: number): this;
    copyArray(array: ArrayLike<number>): this;
    applyMatrix3(m: Matrix3): this;
    applyMatrix4(m: Matrix4): this;
    applyNormalMatrix(m: Matrix3): this;
    transformDirection(m: Matrix4): this;
    set(value: ArrayLike<number> | ArrayBufferView, offset?: number): this;
    getComponent(index: number, component: number): number;
    setComponent(index: number, component: number, value: number): void;
    getX(index: number): number;
    setX(index: number, x: number): this;
    getY(index: number): number;
    setY(index: number, y: number): this;
    getZ(index: number): number;
    setZ(index: number, z: number): this;
    getW(index: number): number;
    setW(index: number, z: number): this;
    setXY(index: number, x: number, y: number): this;
    setXYZ(index: number, x: number, y: number, z: number): this;
    setXYZW(index: number, x: number, y: number, z: number, w: number): this;
    toJSON(): BufferAttributeJSON;
    dispose(): void;
}
declare class InterleavedBuffer {
    readonly isInterleavedBuffer: true;
    constructor(array: TypedArray, stride: number);
    array: TypedArray;
    stride: number;
    usage: Usage;
    updateRanges: Array<{
        start: number;
        count: number;
    }>;
    version: number;
    count: number;
    set needsUpdate(value: boolean);
    uuid: string;
    onUploadCallback: () => void;
    onUpload(callback: () => void): this;
    set(value: ArrayLike<number>, offset?: number): this;
    setUsage(value: Usage): this;
    addUpdateRange(start: number, count: number): void;
    clearUpdateRanges(): void;
    copy(source: InterleavedBuffer): this;
    copyAt(index1: number, attribute: InterleavedBufferAttribute, index2: number): this;
    clone(data: {}): InterleavedBuffer;
    toJSON(data: {}): {
        uuid: string;
        buffer: string;
        type: string;
        stride: number;
    };
}
declare class InterleavedBufferAttribute {
    constructor(interleavedBuffer: InterleavedBuffer, itemSize: number, offset: number, normalized?: boolean);
    name: string;
    data: InterleavedBuffer;
    itemSize: number;
    offset: number;
    normalized: boolean;
    get count(): number;
    get array(): TypedArray;
    set needsUpdate(value: boolean);
    readonly isInterleavedBufferAttribute: true;
    applyMatrix4(m: Matrix4): this;
    applyNormalMatrix(m: Matrix3): this;
    transformDirection(m: Matrix4): this;
    getComponent(index: number, component: number): number;
    setComponent(index: number, component: number, value: number): this;
    getX(index: number): number;
    setX(index: number, x: number): this;
    getY(index: number): number;
    setY(index: number, y: number): this;
    getZ(index: number): number;
    setZ(index: number, z: number): this;
    getW(index: number): number;
    setW(index: number, z: number): this;
    setXY(index: number, x: number, y: number): this;
    setXYZ(index: number, x: number, y: number, z: number): this;
    setXYZW(index: number, x: number, y: number, z: number, w: number): this;
    clone(data?: {}): BufferAttribute;
    toJSON(data?: {}): {
        isInterleavedBufferAttribute: true;
        itemSize: number;
        data: string;
        offset: number;
        normalized: boolean;
    };
}
export interface QuaternionLike {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
}
export type QuaternionTuple = [
    x: number,
    y: number,
    z: number,
    w: number
];
declare class Quaternion {
    constructor(x?: number, y?: number, z?: number, w?: number);
    x: number;
    y: number;
    z: number;
    w: number;
    readonly isQuaternion: true;
    set(x: number, y: number, z: number, w: number): this;
    clone(): this;
    copy(q: QuaternionLike): this;
    setFromEuler(euler: Euler, update?: boolean): this;
    setFromAxisAngle(axis: Vector3Like, angle: number): this;
    setFromRotationMatrix(m: Matrix4): this;
    setFromUnitVectors(vFrom: Vector3, vTo: Vector3Like): this;
    angleTo(q: Quaternion): number;
    rotateTowards(q: Quaternion, step: number): this;
    identity(): this;
    invert(): this;
    conjugate(): this;
    dot(v: Quaternion): number;
    lengthSq(): number;
    length(): number;
    normalize(): this;
    multiply(q: Quaternion): this;
    premultiply(q: Quaternion): this;
    multiplyQuaternions(a: Quaternion, b: Quaternion): this;
    slerp(qb: Quaternion, t: number): this;
    slerpQuaternions(qa: Quaternion, qb: Quaternion, t: number): this;
    equals(v: Quaternion): boolean;
    fromArray(array: number[] | ArrayLike<number>, offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
    toArray(array?: QuaternionTuple, offset?: 0): QuaternionTuple;
    toArray(array: ArrayLike<number>, offset?: number): ArrayLike<number>;
    toJSON(): [
        number,
        number,
        number,
        number
    ];
    fromBufferAttribute(attribute: BufferAttribute | InterleavedBufferAttribute, index: number): this;
    _onChange(callback: () => void): this;
    _onChangeCallback: () => void;
    static slerpFlat(dst: number[], dstOffset: number, src0: number[], srcOffset: number, src1: number[], stcOffset1: number, t: number): void;
    static multiplyQuaternionsFlat(dst: number[], dstOffset: number, src0: number[], srcOffset: number, src1: number[], stcOffset1: number): number[];
    random(): this;
    [Symbol.iterator](): Generator<number, void>;
}
export type EulerOrder = "XYZ" | "YXZ" | "ZXY" | "ZYX" | "YZX" | "XZY";
export type EulerTuple = [
    x: number,
    y: number,
    z: number,
    order?: EulerOrder
];
declare class Euler {
    constructor(x?: number, y?: number, z?: number, order?: EulerOrder);
    x: number;
    y: number;
    z: number;
    order: EulerOrder;
    readonly isEuler: true;
    _onChangeCallback: () => void;
    set(x: number, y: number, z: number, order?: EulerOrder): Euler;
    clone(): this;
    copy(euler: Euler): this;
    setFromRotationMatrix(m: Matrix4, order?: EulerOrder, update?: boolean): Euler;
    setFromQuaternion(q: Quaternion, order?: EulerOrder, update?: boolean): Euler;
    setFromVector3(v: Vector3, order?: EulerOrder): Euler;
    reorder(newOrder: EulerOrder): Euler;
    equals(euler: Euler): boolean;
    fromArray(array: EulerTuple): Euler;
    toArray(array?: Partial<EulerTuple>, offset?: number): EulerTuple;
    _onChange(callback: () => void): this;
    static DEFAULT_ORDER: "XYZ";
    [Symbol.iterator](): Generator<string | number, void>;
}
export type Matrix4Tuple = [
    n11: number,
    n12: number,
    n13: number,
    n14: number,
    n21: number,
    n22: number,
    n23: number,
    n24: number,
    n31: number,
    n32: number,
    n33: number,
    n34: number,
    n41: number,
    n42: number,
    n43: number,
    n44: number
];
export class Matrix4 {
    constructor();
    constructor(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number);
    elements: Matrix4Tuple;
    set(n11: number, n12: number, n13: number, n14: number, n21: number, n22: number, n23: number, n24: number, n31: number, n32: number, n33: number, n34: number, n41: number, n42: number, n43: number, n44: number): this;
    identity(): this;
    clone(): Matrix4;
    copy(m: Matrix4): this;
    copyPosition(m: Matrix4): this;
    setFromMatrix3(m: Matrix3): this;
    extractBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): this;
    makeBasis(xAxis: Vector3, yAxis: Vector3, zAxis: Vector3): this;
    extractRotation(m: Matrix4): this;
    makeRotationFromEuler(euler: Euler): this;
    makeRotationFromQuaternion(q: Quaternion): this;
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
    multiply(m: Matrix4): this;
    premultiply(m: Matrix4): this;
    multiplyMatrices(a: Matrix4, b: Matrix4): this;
    multiplyScalar(s: number): this;
    determinant(): number;
    determinantAffine(): number;
    transpose(): this;
    setPosition(v: Vector3): this;
    setPosition(x: number, y: number, z: number): this;
    invert(): this;
    scale(v: Vector3): this;
    getMaxScaleOnAxis(): number;
    makeTranslation(v: Vector3): this;
    makeTranslation(x: number, y: number, z: number): this;
    makeRotationX(theta: number): this;
    makeRotationY(theta: number): this;
    makeRotationZ(theta: number): this;
    makeRotationAxis(axis: Vector3, angle: number): this;
    makeScale(x: number, y: number, z: number): this;
    makeShear(xy: number, xz: number, yx: number, yz: number, zx: number, zy: number): this;
    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    makePerspective(left: number, right: number, top: number, bottom: number, near: number, far: number, coordinateSystem?: CoordinateSystem, reversedDepth?: boolean): this;
    makeOrthographic(left: number, right: number, top: number, bottom: number, near: number, far: number, coordinateSystem?: CoordinateSystem, reversedDepth?: boolean): this;
    equals(matrix: Matrix4): boolean;
    fromArray(array: ArrayLike<number>, offset?: number): this;
    toArray<TArray extends ArrayLike<number> = Matrix4Tuple>(array?: TArray, offset?: number): TArray;
}
export type Vector4Tuple = [
    number,
    number,
    number,
    number
];
export interface Vector4Like {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
}
declare class Vector4 {
    constructor(x?: number, y?: number, z?: number, w?: number);
    x: number;
    y: number;
    z: number;
    w: number;
    width: number;
    height: number;
    readonly isVector4: true;
    set(x: number, y: number, z: number, w: number): this;
    setScalar(scalar: number): this;
    setX(x: number): this;
    setY(y: number): this;
    setZ(z: number): this;
    setW(w: number): this;
    setComponent(index: number, value: number): this;
    getComponent(index: number): number;
    clone(): this;
    copy(v: Vector4Like): this;
    add(v: Vector4Like): this;
    addScalar(scalar: number): this;
    addVectors(a: Vector4Like, b: Vector4Like): this;
    addScaledVector(v: Vector4Like, s: number): this;
    sub(v: Vector4Like): this;
    subScalar(s: number): this;
    subVectors(a: Vector4Like, b: Vector4Like): this;
    multiply(v: Vector4Like): this;
    multiplyScalar(s: number): this;
    applyMatrix4(m: Matrix4): this;
    divide(v: Vector4Like): this;
    divideScalar(s: number): this;
    setAxisAngleFromQuaternion(q: QuaternionLike): this;
    setAxisAngleFromRotationMatrix(m: Matrix4): this;
    setFromMatrixPosition(m: Matrix4): this;
    min(v: Vector4Like): this;
    max(v: Vector4Like): this;
    clamp(min: Vector4Like, max: Vector4Like): this;
    clampScalar(min: number, max: number): this;
    floor(): this;
    ceil(): this;
    round(): this;
    roundToZero(): this;
    negate(): this;
    dot(v: Vector4Like): number;
    lengthSq(): number;
    length(): number;
    manhattanLength(): number;
    normalize(): this;
    setLength(length: number): this;
    lerp(v: Vector4Like, alpha: number): this;
    lerpVectors(v1: Vector4Like, v2: Vector4Like, alpha: number): this;
    equals(v: Vector4Like): boolean;
    fromArray(array: number[] | ArrayLike<number>, offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
    toArray(array?: Vector4Tuple, offset?: 0): Vector4Tuple;
    toArray(array: ArrayLike<number>, offset?: number): ArrayLike<number>;
    fromBufferAttribute(attribute: BufferAttribute, index: number): this;
    random(): this;
    [Symbol.iterator](): Iterator<number>;
}
declare class Camera extends Object3D {
    readonly isCamera: boolean;
    matrixWorldInverse: Matrix4;
    projectionMatrix: Matrix4;
    projectionMatrixInverse: Matrix4;
    coordinateSystem: CoordinateSystem;
    viewport?: Vector4;
    get reversedDepth(): boolean;
    clone(): this;
    copy(source: Camera, recursive?: boolean): this;
}
declare const _colorKeywords: {
    aliceblue: 15792383;
    antiquewhite: 16444375;
    aqua: 65535;
    aquamarine: 8388564;
    azure: 15794175;
    beige: 16119260;
    bisque: 16770244;
    black: 0;
    blanchedalmond: 16772045;
    blue: 255;
    blueviolet: 9055202;
    brown: 10824234;
    burlywood: 14596231;
    cadetblue: 6266528;
    chartreuse: 8388352;
    chocolate: 13789470;
    coral: 16744272;
    cornflowerblue: 6591981;
    cornsilk: 16775388;
    crimson: 14423100;
    cyan: 65535;
    darkblue: 139;
    darkcyan: 35723;
    darkgoldenrod: 12092939;
    darkgray: 11119017;
    darkgreen: 25600;
    darkgrey: 11119017;
    darkkhaki: 12433259;
    darkmagenta: 9109643;
    darkolivegreen: 5597999;
    darkorange: 16747520;
    darkorchid: 10040012;
    darkred: 9109504;
    darksalmon: 15308410;
    darkseagreen: 9419919;
    darkslateblue: 4734347;
    darkslategray: 3100495;
    darkslategrey: 3100495;
    darkturquoise: 52945;
    darkviolet: 9699539;
    deeppink: 16716947;
    deepskyblue: 49151;
    dimgray: 6908265;
    dimgrey: 6908265;
    dodgerblue: 2003199;
    firebrick: 11674146;
    floralwhite: 16775920;
    forestgreen: 2263842;
    fuchsia: 16711935;
    gainsboro: 14474460;
    ghostwhite: 16316671;
    gold: 16766720;
    goldenrod: 14329120;
    gray: 8421504;
    green: 32768;
    greenyellow: 11403055;
    grey: 8421504;
    honeydew: 15794160;
    hotpink: 16738740;
    indianred: 13458524;
    indigo: 4915330;
    ivory: 16777200;
    khaki: 15787660;
    lavender: 15132410;
    lavenderblush: 16773365;
    lawngreen: 8190976;
    lemonchiffon: 16775885;
    lightblue: 11393254;
    lightcoral: 15761536;
    lightcyan: 14745599;
    lightgoldenrodyellow: 16448210;
    lightgray: 13882323;
    lightgreen: 9498256;
    lightgrey: 13882323;
    lightpink: 16758465;
    lightsalmon: 16752762;
    lightseagreen: 2142890;
    lightskyblue: 8900346;
    lightslategray: 7833753;
    lightslategrey: 7833753;
    lightsteelblue: 11584734;
    lightyellow: 16777184;
    lime: 65280;
    limegreen: 3329330;
    linen: 16445670;
    magenta: 16711935;
    maroon: 8388608;
    mediumaquamarine: 6737322;
    mediumblue: 205;
    mediumorchid: 12211667;
    mediumpurple: 9662683;
    mediumseagreen: 3978097;
    mediumslateblue: 8087790;
    mediumspringgreen: 64154;
    mediumturquoise: 4772300;
    mediumvioletred: 13047173;
    midnightblue: 1644912;
    mintcream: 16121850;
    mistyrose: 16770273;
    moccasin: 16770229;
    navajowhite: 16768685;
    navy: 128;
    oldlace: 16643558;
    olive: 8421376;
    olivedrab: 7048739;
    orange: 16753920;
    orangered: 16729344;
    orchid: 14315734;
    palegoldenrod: 15657130;
    palegreen: 10025880;
    paleturquoise: 11529966;
    palevioletred: 14381203;
    papayawhip: 16773077;
    peachpuff: 16767673;
    peru: 13468991;
    pink: 16761035;
    plum: 14524637;
    powderblue: 11591910;
    purple: 8388736;
    rebeccapurple: 6697881;
    red: 16711680;
    rosybrown: 12357519;
    royalblue: 4286945;
    saddlebrown: 9127187;
    salmon: 16416882;
    sandybrown: 16032864;
    seagreen: 3050327;
    seashell: 16774638;
    sienna: 10506797;
    silver: 12632256;
    skyblue: 8900331;
    slateblue: 6970061;
    slategray: 7372944;
    slategrey: 7372944;
    snow: 16775930;
    springgreen: 65407;
    steelblue: 4620980;
    tan: 13808780;
    teal: 32896;
    thistle: 14204888;
    tomato: 16737095;
    turquoise: 4251856;
    violet: 15631086;
    wheat: 16113331;
    white: 16777215;
    whitesmoke: 16119285;
    yellow: 16776960;
    yellowgreen: 10145074;
};
export type ColorRepresentation = Color | string | number;
export interface HSL {
    h: number;
    s: number;
    l: number;
}
export interface RGB {
    r: number;
    g: number;
    b: number;
}
export class Color {
    constructor(color?: ColorRepresentation);
    constructor(r: number, g: number, b: number);
    readonly isColor: true;
    r: number;
    g: number;
    b: number;
    set(...args: [
        color: ColorRepresentation
    ] | [
        r: number,
        g: number,
        b: number
    ]): this;
    setFromVector3(vector: Vector3): this;
    setScalar(scalar: number): this;
    setHex(hex: number, colorSpace?: string): this;
    setRGB(r: number, g: number, b: number, colorSpace?: string): this;
    setHSL(h: number, s: number, l: number, colorSpace?: string): this;
    setStyle(style: string, colorSpace?: string): this;
    setColorName(style: string, colorSpace?: string): this;
    clone(): this;
    copy(color: Color): this;
    copySRGBToLinear(color: Color): this;
    copyLinearToSRGB(color: Color): this;
    convertSRGBToLinear(): this;
    convertLinearToSRGB(): this;
    getHex(colorSpace?: string): number;
    getHexString(colorSpace?: string): string;
    getHSL(target: HSL, colorSpace?: string): HSL;
    getRGB(target: RGB, colorSpace?: string): RGB;
    getStyle(colorSpace?: string): string;
    offsetHSL(h: number, s: number, l: number): this;
    add(color: Color): this;
    addColors(color1: Color, color2: Color): this;
    addScalar(s: number): this;
    applyMatrix3(m: Matrix3): this;
    sub(color: Color): this;
    multiply(color: Color): this;
    multiplyScalar(s: number): this;
    lerp(color: Color, alpha: number): this;
    lerpColors(color1: Color, color2: Color, alpha: number): this;
    lerpHSL(color: Color, alpha: number): this;
    equals(color: Color): boolean;
    fromArray(array: number[] | ArrayLike<number>, offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
    toArray(xyz: ArrayLike<number>, offset?: number): ArrayLike<number>;
    toJSON(): number;
    fromBufferAttribute(attribute: BufferAttribute | InterleavedBufferAttribute, index: number): this;
    [Symbol.iterator](): Generator<number, void>;
    static NAMES: typeof _colorKeywords;
}
declare class Cylindrical {
    constructor(radius?: number, theta?: number, y?: number);
    radius: number;
    theta: number;
    y: number;
    clone(): this;
    copy(other: Cylindrical): this;
    set(radius: number, theta: number, y: number): this;
    setFromVector3(vec3: Vector3): this;
    setFromCartesianCoords(x: number, y: number, z: number): this;
}
declare class Spherical {
    constructor(radius?: number, phi?: number, theta?: number);
    radius: number;
    phi: number;
    theta: number;
    set(radius: number, phi: number, theta: number): this;
    clone(): this;
    copy(other: Spherical): this;
    makeSafe(): this;
    setFromVector3(v: Vector3): this;
    setFromCartesianCoords(x: number, y: number, z: number): this;
}
export type Vector3Tuple = [
    number,
    number,
    number
];
export interface Vector3Like {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}
export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    readonly isVector3: true;
    set(x: number, y: number, z?: number): this;
    setScalar(scalar: number): this;
    setX(x: number): this;
    setY(y: number): this;
    setZ(z: number): this;
    setComponent(index: number, value: number): this;
    getComponent(index: number): number;
    clone(): this;
    copy(v: Vector3Like): this;
    add(v: Vector3Like): this;
    addScalar(s: number): this;
    addVectors(a: Vector3Like, b: Vector3Like): this;
    addScaledVector(v: Vector3Like, s: number): this;
    sub(v: Vector3Like): this;
    subScalar(s: number): this;
    subVectors(a: Vector3Like, b: Vector3Like): this;
    multiply(v: Vector3Like): this;
    multiplyScalar(s: number): this;
    multiplyVectors(a: Vector3Like, b: Vector3Like): this;
    applyEuler(euler: Euler): this;
    applyAxisAngle(axis: Vector3Like, angle: number): this;
    applyMatrix3(m: Matrix3): this;
    applyNormalMatrix(m: Matrix3): this;
    applyMatrix4(m: Matrix4): this;
    applyQuaternion(q: QuaternionLike): this;
    project(camera: Camera): this;
    unproject(camera: Camera): this;
    transformDirection(m: Matrix4): this;
    divide(v: Vector3Like): this;
    divideScalar(s: number): this;
    min(v: Vector3Like): this;
    max(v: Vector3Like): this;
    clamp(min: Vector3Like, max: Vector3Like): this;
    clampScalar(min: number, max: number): this;
    clampLength(min: number, max: number): this;
    floor(): this;
    ceil(): this;
    round(): this;
    roundToZero(): this;
    negate(): this;
    dot(v: Vector3Like): number;
    lengthSq(): number;
    length(): number;
    manhattanLength(): number;
    normalize(): this;
    setLength(l: number): this;
    lerp(v: Vector3Like, alpha: number): this;
    lerpVectors(v1: Vector3Like, v2: Vector3Like, alpha: number): this;
    cross(v: Vector3Like): this;
    crossVectors(a: Vector3Like, b: Vector3Like): this;
    projectOnVector(v: Vector3): this;
    projectOnPlane(planeNormal: Vector3): this;
    reflect(normal: Vector3Like): this;
    angleTo(v: Vector3): number;
    distanceTo(v: Vector3Like): number;
    distanceToSquared(v: Vector3Like): number;
    manhattanDistanceTo(v: Vector3Like): number;
    setFromSpherical(s: Spherical): this;
    setFromSphericalCoords(r: number, phi: number, theta: number): this;
    setFromCylindrical(s: Cylindrical): this;
    setFromCylindricalCoords(radius: number, theta: number, y: number): this;
    setFromMatrixPosition(m: Matrix4): this;
    setFromMatrixScale(m: Matrix4): this;
    setFromMatrixColumn(matrix: Matrix4, index: number): this;
    setFromMatrix3Column(matrix: Matrix3, index: number): this;
    setFromEuler(e: Euler): this;
    setFromColor(color: RGB): this;
    equals(v: Vector3Like): boolean;
    fromArray(array: number[] | ArrayLike<number>, offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
    toArray(array?: Vector3Tuple, offset?: 0): Vector3Tuple;
    toArray(array: ArrayLike<number>, offset?: number): ArrayLike<number>;
    fromBufferAttribute(attribute: BufferAttribute | InterleavedBufferAttribute, index: number): this;
    random(): this;
    randomDirection(): this;
    [Symbol.iterator](): Iterator<number>;
}
declare abstract class Interpolant<TSettings = {}> {
    constructor(parameterPositions: TypedArray, sampleValues: TypedArray, sampleSize: number, resultBuffer?: TypedArray);
    parameterPositions: TypedArray;
    resultBuffer: TypedArray;
    sampleValues: TypedArray;
    valueSize: number;
    settings: TSettings | null;
    DefaultSettings_: TSettings;
    evaluate(t: number): TypedArray;
    getSettings_(): unknown;
    copySampleValue_(index: number): TypedArray;
    abstract interpolate_(i1: number, t0: number, t: number, t1: number): TypedArray;
    intervalChanged_(i1: number, t0: number, t1: number): void;
}
declare class BezierInterpolant extends Interpolant {
    interpolate_(i1: number, t0: number, t: number, t1: number): TypedArray;
}
export interface CubicInterpolantSettings {
    endingStart: InterpolationEndingModes;
    endingEnd: InterpolationEndingModes;
}
declare class CubicInterpolant extends Interpolant<CubicInterpolantSettings> {
    intervalChanged_(i1: number, t0: number, t1: number): void;
    interpolate_(i1: number, t0: number, t: number, t1: number): TypedArray;
}
declare class DiscreteInterpolant extends Interpolant {
    interpolate_(i1: number): TypedArray;
}
declare class LinearInterpolant extends Interpolant {
    interpolate_(i1: number, t0: number, t: number, t1: number): TypedArray;
}
export interface KeyframeTrackSettings {
    inTangents: TypedArray | number[];
    outTangents: TypedArray | number[];
}
export interface KeyframeTrackJSON {
    name: string;
    times: number[];
    values: number[];
    interpolation?: InterpolationModes;
    type: string;
    settings?: {
        inTangents: number[];
        outTangents: number[];
    };
}
declare class KeyframeTrack {
    static toJSON(track: KeyframeTrack): KeyframeTrackJSON;
    constructor(name: string, times: ArrayLike<number>, values: ArrayLike<number | string | boolean>, interpolation?: InterpolationModes);
    name: string;
    times: Float32Array;
    values: Float32Array;
    settings?: KeyframeTrackSettings;
    InterpolantFactoryMethodDiscrete(result?: TypedArray): DiscreteInterpolant;
    InterpolantFactoryMethodLinear(result?: TypedArray): LinearInterpolant;
    InterpolantFactoryMethodSmooth(result?: TypedArray): CubicInterpolant;
    InterpolantFactoryMethodBezier(result?: TypedArray): BezierInterpolant;
    setInterpolation(interpolation: InterpolationModes): KeyframeTrack;
    getInterpolation(): InterpolationModes;
    getValueSize(): number;
    shift(timeOffset: number): KeyframeTrack;
    scale(timeScale: number): KeyframeTrack;
    trim(startTime: number, endTime: number): KeyframeTrack;
    validate(): boolean;
    optimize(): this;
    clone(): this;
    ValueTypeName: string;
    TimeBufferType: TypedArrayConstructor | ArrayConstructor;
    ValueBufferType: TypedArrayConstructor | ArrayConstructor;
    DefaultInterpolation: InterpolationModes;
}
export interface AnimationClipJSON {
    name: string;
    duration: number;
    tracks: KeyframeTrackJSON[];
    uuid: string;
    blendMode: AnimationBlendMode;
}
export interface MorphTarget {
    name: string;
    vertices: Vector3[];
}
declare class AnimationClip {
    static parse(json: AnimationClipJSON): AnimationClip;
    static toJSON(clip: AnimationClip): AnimationClipJSON;
    static CreateFromMorphTargetSequence(name: string, morphTargetSequence: Array<MorphTarget>, fps: number, noLoop: boolean): AnimationClip;
    static findByName(objectOrClipArray: Array<AnimationClip> | Object3D, name: string): AnimationClip | null;
    static CreateClipsFromMorphTargetSequences(morphTargets: Array<MorphTarget>, fps: number, noLoop: boolean): Array<AnimationClip>;
    constructor(name?: string, duration?: number, tracks?: Array<KeyframeTrack>, blendMode?: AnimationBlendMode);
    name: string;
    tracks: Array<KeyframeTrack>;
    duration: number;
    blendMode: AnimationBlendMode;
    readonly uuid: string;
    userData: Record<string, unknown>;
    resetDuration(): AnimationClip;
    trim(): AnimationClip;
    validate(): boolean;
    optimize(): AnimationClip;
    clone(): this;
    toJSON(): AnimationClipJSON;
}
export interface CurveJSON {
    metadata: {
        version: number;
        type: string;
        generator: string;
    };
    arcLengthDivisions: number;
    type: string;
}
export interface CurvePathJSON extends CurveJSON {
    autoClose: boolean;
    curves: CurveJSON[];
}
export interface PathJSON extends CurvePathJSON {
    currentPoint: Vector2Tuple;
}
export interface ShapeJSON extends PathJSON {
    uuid: string;
    holes: PathJSON[];
}
declare class Line3 {
    constructor(start?: Vector3, end?: Vector3);
    start: Vector3;
    end: Vector3;
    set(start?: Vector3, end?: Vector3): Line3;
    clone(): this;
    copy(line: Line3): this;
    getCenter(target: Vector3): Vector3;
    delta(target: Vector3): Vector3;
    distanceSq(): number;
    distance(): number;
    at(t: number, target: Vector3): Vector3;
    closestPointToPointParameter(point: Vector3, clampToLine?: boolean): number;
    closestPointToPoint(point: Vector3, clampToLine: boolean, target: Vector3): Vector3;
    distanceSqToLine3(line: Line3, c1?: Vector3, c2?: Vector3): number;
    applyMatrix4(matrix: Matrix4): Line3;
    equals(line: Line3): boolean;
}
declare class Sphere {
    constructor(center?: Vector3, radius?: number);
    readonly isSphere: true;
    center: Vector3;
    radius: number;
    set(center: Vector3, radius: number): Sphere;
    setFromPoints(points: Vector3[], optionalCenter?: Vector3): Sphere;
    clone(): this;
    copy(sphere: Sphere): this;
    expandByPoint(point: Vector3): this;
    isEmpty(): boolean;
    makeEmpty(): this;
    containsPoint(point: Vector3): boolean;
    distanceToPoint(point: Vector3): number;
    intersectsSphere(sphere: Sphere): boolean;
    intersectsBox(box: Box3): boolean;
    intersectsPlane(plane: Plane): boolean;
    clampPoint(point: Vector3, target: Vector3): Vector3;
    getBoundingBox(target: Box3): Box3;
    applyMatrix4(matrix: Matrix4): Sphere;
    translate(offset: Vector3): Sphere;
    equals(sphere: Sphere): boolean;
    union(sphere: Sphere): this;
    empty(): any;
    toJSON(): SphereJSON;
    fromJSON(json: SphereJSON): this;
}
export interface SphereJSON {
    radius: number;
    center: number[];
}
declare class Plane {
    constructor(normal?: Vector3, constant?: number);
    normal: Vector3;
    constant: number;
    readonly isPlane: true;
    set(normal: Vector3, constant: number): Plane;
    setComponents(x: number, y: number, z: number, w: number): Plane;
    setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): Plane;
    setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): Plane;
    clone(): this;
    copy(plane: Plane): this;
    normalize(): Plane;
    negate(): Plane;
    distanceToPoint(point: Vector3): number;
    distanceToSphere(sphere: Sphere): number;
    projectPoint(point: Vector3, target: Vector3): Vector3;
    intersectLine(line: Line3, target: Vector3, clampToLine?: boolean): Vector3 | null;
    intersectsLine(line: Line3): boolean;
    intersectsBox(box: Box3): boolean;
    intersectsSphere(sphere: Sphere): boolean;
    coplanarPoint(target: Vector3): Vector3;
    applyMatrix4(matrix: Matrix4, optionalNormalMatrix?: Matrix3): Plane;
    translate(offset: Vector3): Plane;
    equals(plane: Plane): boolean;
    isIntersectionLine(l: any): any;
    toJSON(): PlaneJSON;
    fromJSON(json: PlaneJSON): this;
}
export interface PlaneJSON {
    normal: number[];
    constant: number;
}
declare class Triangle {
    constructor(a?: Vector3, b?: Vector3, c?: Vector3);
    a: Vector3;
    b: Vector3;
    c: Vector3;
    set(a: Vector3, b: Vector3, c: Vector3): Triangle;
    setFromPointsAndIndices(points: Vector3[], i0: number, i1: number, i2: number): this;
    setFromAttributeAndIndices(attribute: BufferAttribute | InterleavedBufferAttribute, i0: number, i1: number, i2: number): this;
    clone(): this;
    copy(triangle: Triangle): this;
    getArea(): number;
    getMidpoint(target: Vector3): Vector3;
    getNormal(target: Vector3): Vector3;
    getPlane(target: Plane): Plane;
    getBarycoord(point: Vector3, target: Vector3): Vector3 | null;
    getInterpolation(point: Vector3, v1: Vector2, v2: Vector2, v3: Vector2, target: Vector2): Vector2 | null;
    getInterpolation(point: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, target: Vector3): Vector3 | null;
    getInterpolation(point: Vector3, v1: Vector4, v2: Vector4, v3: Vector4, target: Vector4): Vector4 | null;
    containsPoint(point: Vector3): boolean;
    intersectsBox(box: Box3): boolean;
    isFrontFacing(direction: Vector3): boolean;
    closestPointToPoint(point: Vector3, target: Vector3): Vector3;
    equals(triangle: Triangle): boolean;
    static getNormal(a: Vector3, b: Vector3, c: Vector3, target: Vector3): Vector3;
    static getBarycoord(point: Vector3, a: Vector3, b: Vector3, c: Vector3, target: Vector3): Vector3 | null;
    static containsPoint(point: Vector3, a: Vector3, b: Vector3, c: Vector3): boolean;
    static getInterpolation(point: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, v1: Vector2, v2: Vector2, v3: Vector2, target: Vector2): Vector2 | null;
    static getInterpolation(point: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, v1: Vector3, v2: Vector3, v3: Vector3, target: Vector3): Vector3 | null;
    static getInterpolation(point: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, v1: Vector4, v2: Vector4, v3: Vector4, target: Vector4): Vector4 | null;
    static getInterpolatedAttribute(attr: BufferAttribute | InterleavedBufferAttribute, i1: number, i2: number, i3: number, barycoord: Vector3, target: Vector2): Vector2;
    static getInterpolatedAttribute(attr: BufferAttribute | InterleavedBufferAttribute, i1: number, i2: number, i3: number, barycoord: Vector3, target: Vector3): Vector3;
    static getInterpolatedAttribute(attr: BufferAttribute | InterleavedBufferAttribute, i1: number, i2: number, i3: number, barycoord: Vector3, target: Vector4): Vector4;
    static isFrontFacing(a: Vector3, b: Vector3, c: Vector3, direction: Vector3): boolean;
}
declare class Box3 {
    constructor(min?: Vector3, max?: Vector3);
    readonly isBox3: boolean;
    min: Vector3;
    max: Vector3;
    set(min: Vector3, max: Vector3): this;
    setFromArray(array: ArrayLike<number>): this;
    setFromBufferAttribute(attribute: BufferAttribute): this;
    setFromPoints(points: Array<Vector3Like>): this;
    setFromCenterAndSize(center: Vector3, size: Vector3): this;
    setFromObject(object: Object3D, precise?: boolean): this;
    clone(): this;
    copy(box: Box3): this;
    makeEmpty(): this;
    isEmpty(): boolean;
    getCenter(target: Vector3): Vector3;
    getSize(target: Vector3): Vector3;
    expandByPoint(point: Vector3Like): this;
    expandByVector(vector: Vector3): this;
    expandByScalar(scalar: number): this;
    expandByObject(object: Object3D, precise?: boolean): this;
    containsPoint(point: Vector3): boolean;
    containsBox(box: Box3): boolean;
    getParameter(point: Vector3, target: Vector3): Vector3;
    intersectsBox(box: Box3): boolean;
    intersectsSphere(sphere: Sphere): boolean;
    intersectsPlane(plane: Plane): boolean;
    intersectsTriangle(triangle: Triangle): boolean;
    clampPoint(point: Vector3, target: Vector3): Vector3;
    distanceToPoint(point: Vector3): number;
    getBoundingSphere(target: Sphere): Sphere;
    intersect(box: Box3): this;
    union(box: Box3): this;
    applyMatrix4(matrix: Matrix4): this;
    translate(offset: Vector3): this;
    equals(box: Box3): boolean;
    toJSON(): Box3JSON;
    fromJSON(json: Box3JSON): this;
}
export interface Box3JSON {
    min: number[];
    max: number[];
}
declare class StorageBufferAttribute extends BufferAttribute {
    readonly isStorageBufferAttribute: true;
    constructor(array: TypedArray | number, itemSize: number);
}
declare class IndirectStorageBufferAttribute extends StorageBufferAttribute {
    readonly isIndirectStorageBufferAttribute: true;
    constructor(array: TypedArray, itemSize: number);
}
declare class GLBufferAttribute {
    constructor(buffer: WebGLBuffer, type: GLenum, itemSize: number, elementSize: 1 | 2 | 4, count: number, normalized?: boolean);
    readonly isGLBufferAttribute: true;
    name: string;
    buffer: WebGLBuffer;
    type: GLenum;
    itemSize: number;
    elementSize: 1 | 2 | 4;
    count: number;
    normalized: boolean;
    version: number;
    set needsUpdate(value: boolean);
    setBuffer(buffer: WebGLBuffer): this;
    setType(type: GLenum, elementSize: 1 | 2 | 4): this;
    setItemSize(itemSize: number): this;
    setCount(count: number): this;
}
export type NormalBufferAttributes = Record<string, BufferAttribute | InterleavedBufferAttribute>;
export type NormalOrGLBufferAttributes = Record<string, BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute>;
export interface BufferGeometryJSON {
    metadata?: {
        version: number;
        type: string;
        generator: string;
    };
    uuid: string;
    type: string;
    name?: string;
    userData?: Record<string, unknown>;
    data?: {
        attributes: Record<string, BufferAttributeJSON>;
        index?: {
            type: string;
            array: number[];
        };
        morphAttributes?: Record<string, BufferAttributeJSON[]>;
        morphTargetsRelative?: boolean;
        groups?: GeometryGroup[];
        boundingSphere?: {
            center: Vector3Tuple;
            radius: number;
        };
    };
}
export interface GeometryGroup {
    start: number;
    count: number;
    materialIndex?: number | undefined;
}
export interface BufferGeometryEventMap {
    dispose: {};
}
export class BufferGeometry<Attributes extends NormalOrGLBufferAttributes = NormalBufferAttributes, TEventMap extends BufferGeometryEventMap = BufferGeometryEventMap> extends EventDispatcher<TEventMap> {
    constructor();
    id: number;
    uuid: string;
    name: string;
    readonly type: string | "BufferGeometry";
    index: BufferAttribute | null;
    indirect: IndirectStorageBufferAttribute | null;
    indirectOffset: number | number[];
    attributes: Attributes;
    morphAttributes: {
        position?: Array<BufferAttribute | InterleavedBufferAttribute> | undefined;
        normal?: Array<BufferAttribute | InterleavedBufferAttribute> | undefined;
        color?: Array<BufferAttribute | InterleavedBufferAttribute> | undefined;
    };
    morphTargetsRelative: boolean;
    groups: GeometryGroup[];
    boundingBox: Box3 | null;
    boundingSphere: Sphere | null;
    drawRange: {
        start: number;
        count: number;
    };
    userData: Record<string, any>;
    readonly isBufferGeometry: true;
    getIndex(): BufferAttribute | null;
    setIndex(index: BufferAttribute | number[] | null): this;
    setIndirect(indirect: IndirectStorageBufferAttribute | null, indirectOffset?: number | number[]): this;
    getIndirect(): IndirectStorageBufferAttribute | null;
    setAttribute<K extends keyof Attributes>(name: K, attribute: Attributes[K]): this;
    getAttribute<K extends keyof Attributes>(name: K): Attributes[K];
    deleteAttribute(name: keyof Attributes): this;
    hasAttribute(name: keyof Attributes): boolean;
    addGroup(start: number, count: number, materialIndex?: number): void;
    clearGroups(): void;
    setDrawRange(start: number, count: number): void;
    applyMatrix4(matrix: Matrix4): this;
    applyQuaternion(quaternion: Quaternion): this;
    rotateX(angle: number): this;
    rotateY(angle: number): this;
    rotateZ(angle: number): this;
    translate(x: number, y: number, z: number): this;
    scale(x: number, y: number, z: number): this;
    lookAt(vector: Vector3): this;
    center(): this;
    setFromPoints(points: Vector3[] | Vector2[]): this;
    computeBoundingBox(): void;
    computeBoundingSphere(): void;
    computeTangents(): void;
    computeVertexNormals(): void;
    normalizeNormals(): void;
    toNonIndexed(): BufferGeometry;
    toJSON(): BufferGeometryJSON;
    clone(): this;
    copy(source: BufferGeometry): this;
    dispose(): void;
}
declare class Group<TEventMap extends Object3DEventMap = Object3DEventMap> extends Object3D<TEventMap> {
    constructor();
    readonly isGroup: true;
}
declare const NodeShaderStage: {
    readonly VERTEX: "vertex";
    readonly FRAGMENT: "fragment";
};
declare const NodeUpdateType: {
    readonly NONE: "none";
    readonly FRAME: "frame";
    readonly RENDER: "render";
    readonly OBJECT: "object";
};
export type NodeShaderStage = "vertex" | "fragment" | "compute";
export type NodeUpdateType = "none" | "frame" | "render" | "object";
export interface CompressedTextureMipmap {
    data: TypedArray;
    width: number;
    height: number;
}
declare class CubeTexture<TImage = unknown> extends Texture<TImage[]> {
    constructor(images?: TImage[], mapping?: CubeTextureMapping, wrapS?: Wrapping, wrapT?: Wrapping, magFilter?: MagnificationTextureFilter, minFilter?: MinificationTextureFilter, format?: PixelFormat, type?: TextureDataType, anisotropy?: number, colorSpace?: string);
    readonly isCubeTexture: true;
    get images(): TImage[];
    set images(value: TImage[]);
    mapping: CubeTextureMapping;
    flipY: boolean;
}
export type SerializedImage = string | {
    data: number[];
    width: number;
    height: number;
    type: string;
};
export interface TextureSourceJSON {
    uuid: string;
    url: SerializedImage | SerializedImage[];
}
declare class TextureSource<TData> {
    readonly isTextureSource: true;
    readonly id: number;
    uuid: string;
    data: TData;
    dataReady: boolean;
    version: number;
    constructor(data: TData);
    getSize(target: Vector3): Vector3;
    set needsUpdate(value: boolean);
    toJSON(meta?: string | {}): TextureSourceJSON;
}
export interface TextureParameters {
    mapping?: AnyMapping | undefined;
    wrapS?: Wrapping | undefined;
    wrapT?: Wrapping | undefined;
    wrapR?: Wrapping | undefined;
    format?: PixelFormat | undefined;
    internalFormat?: PixelFormatGPU | null | undefined;
    type?: TextureDataType | undefined;
    colorSpace?: ColorSpace | undefined;
    magFilter?: MagnificationTextureFilter | undefined;
    minFilter?: MinificationTextureFilter | undefined;
    anisotropy?: number | undefined;
    flipY?: boolean | undefined;
    generateMipmaps?: boolean | undefined;
    mipmapsAutoUpdate?: boolean | undefined;
}
export interface TextureJSON {
    metadata: {
        version: number;
        type: string;
        generator: string;
    };
    uuid: string;
    name: string;
    image: string;
    mapping: AnyMapping;
    channel: number;
    repeat: [
        x: number,
        y: number
    ];
    offset: [
        x: number,
        y: number
    ];
    center: [
        x: number,
        y: number
    ];
    rotation: number;
    wrap: [
        wrapS: number,
        wrapT: number
    ];
    format: AnyPixelFormat;
    internalFormat: PixelFormatGPU | null;
    type: TextureDataType;
    colorSpace: string;
    minFilter: MinificationTextureFilter;
    magFilter: MagnificationTextureFilter;
    anisotropy: number;
    flipY: boolean;
    generateMipmaps: boolean;
    mipmapsAutoUpdate: boolean;
    premultiplyAlpha: boolean;
    unpackAlignment: number;
    userData?: Record<string, unknown>;
}
interface OffscreenCanvas$1 extends EventTarget {
}
export interface TextureEventMap {
    dispose: {};
}
export class Texture<TImage = unknown, TEventMap extends TextureEventMap = TextureEventMap> extends EventDispatcher<TEventMap> {
    constructor(image?: TImage, mapping?: Mapping, wrapS?: Wrapping, wrapT?: Wrapping, magFilter?: MagnificationTextureFilter, minFilter?: MinificationTextureFilter, format?: PixelFormat, type?: TextureDataType, anisotropy?: number, colorSpace?: ColorSpace);
    constructor(image: TImage, mapping: Mapping, wrapS: Wrapping, wrapT: Wrapping, magFilter: MagnificationTextureFilter, minFilter: MinificationTextureFilter, format: PixelFormat, type: TextureDataType, anisotropy: number);
    readonly isTexture: true;
    readonly id: number;
    uuid: string;
    name: string;
    source: TextureSource<TImage>;
    get width(): number;
    get height(): number;
    get depth(): number;
    get image(): TImage;
    set image(data: TImage);
    mipmaps: CompressedTextureMipmap[] | CubeTexture[] | HTMLCanvasElement[];
    mapping: AnyMapping;
    channel: number;
    wrapS: Wrapping;
    wrapT: Wrapping;
    magFilter: MagnificationTextureFilter;
    minFilter: MinificationTextureFilter;
    anisotropy: number;
    format: AnyPixelFormat;
    type: TextureDataType;
    internalFormat: PixelFormatGPU | null;
    matrix: Matrix3;
    matrixAutoUpdate: boolean;
    offset: Vector2;
    repeat: Vector2;
    center: Vector2;
    rotation: number;
    generateMipmaps: boolean;
    mipmapsAutoUpdate: boolean;
    premultiplyAlpha: boolean;
    flipY: boolean;
    unpackAlignment: number;
    colorSpace: string;
    isRenderTargetTexture: boolean;
    isArrayTexture: boolean;
    userData: Record<string, any>;
    updateRanges: Array<{
        start: number;
        count: number;
    }>;
    version: number;
    pmremVersion: number;
    isPMREMTexture: boolean;
    normalized: boolean;
    set needsUpdate(value: boolean);
    set needsPMREMUpdate(value: boolean);
    static DEFAULT_ANISOTROPY: number;
    static DEFAULT_IMAGE: null;
    static DEFAULT_MAPPING: Mapping;
    renderTarget: RenderTarget | null;
    onUpdate: ((texture: Texture) => void) | null;
    transformUv(uv: Vector2): Vector2;
    updateMatrix(): void;
    addUpdateRange(start: number, count: number): void;
    clearUpdateRanges(): void;
    clone(): this;
    copy(source: Texture<TImage>): this;
    setValues(values: TextureParameters): void;
    toJSON(meta?: string | {}): TextureJSON;
    dispose(): void;
}
declare class DepthTexture<TImage = DepthTextureImageData> extends Texture<TImage> {
    constructor(width?: number, height?: number, type?: TextureDataType, mapping?: Mapping, wrapS?: Wrapping, wrapT?: Wrapping, magFilter?: MagnificationTextureFilter, minFilter?: MinificationTextureFilter, anisotropy?: number, format?: DepthTexturePixelFormat, depth?: number);
    readonly isDepthTexture: true;
    flipY: boolean;
    magFilter: MagnificationTextureFilter;
    minFilter: MinificationTextureFilter;
    generateMipmaps: boolean;
    format: DepthTexturePixelFormat;
    type: TextureDataType;
    compareFunction: TextureComparisonFunction | null;
}
export interface DepthTextureImageData {
    width: number | undefined;
    height: number | undefined;
    depth: number;
}
export interface RenderTargetOptions extends TextureParameters {
    depthBuffer?: boolean | undefined;
    stencilBuffer?: boolean | undefined;
    resolveColorBuffer?: boolean | undefined;
    resolveDepthBuffer?: boolean | undefined;
    resolveStencilBuffer?: boolean | undefined;
    storeMultisampledColorBuffer?: boolean | undefined;
    storeMultisampledDepthBuffer?: boolean | undefined;
    storeMultisampledStencilBuffer?: boolean | undefined;
    depthTexture?: DepthTexture | null | undefined;
    samples?: number | undefined;
    count?: number | undefined;
    depth?: number | undefined;
    multiview?: boolean | undefined;
    useArrayDepthTexture?: boolean | undefined;
}
export interface RenderTargetEventMap {
    dispose: {};
}
declare class RenderTarget<TTexture extends Texture | Texture[] = Texture, TEventMap extends RenderTargetEventMap = RenderTargetEventMap> extends EventDispatcher<TEventMap> {
    readonly isRenderTarget: true;
    width: number;
    height: number;
    depth: number;
    scissor: Vector4;
    scissorTest: boolean;
    viewport: Vector4;
    textures: TTexture[];
    depthBuffer: boolean;
    stencilBuffer: boolean;
    resolveColorBuffer: boolean;
    resolveDepthBuffer: boolean;
    resolveStencilBuffer: boolean;
    storeMultisampledColorBuffer: boolean;
    storeMultisampledDepthBuffer: boolean;
    storeMultisampledStencilBuffer: boolean;
    samples: number;
    multiview: boolean;
    useArrayDepthTexture: boolean;
    constructor(width?: number, height?: number, options?: RenderTargetOptions);
    get texture(): TTexture;
    set texture(value: TTexture);
    set depthTexture(current: DepthTexture | null);
    get depthTexture(): DepthTexture | null;
    setSize(width: number, height: number, depth?: number): void;
    clone(): this;
    copy(source: RenderTarget): this;
    dispose(): void;
}
declare class Box2 {
    constructor(min?: Vector2, max?: Vector2);
    min: Vector2;
    max: Vector2;
    set(min: Vector2, max: Vector2): Box2;
    setFromPoints(points: Vector2Like[]): Box2;
    setFromCenterAndSize(center: Vector2, size: Vector2): Box2;
    clone(): this;
    copy(box: Box2): this;
    makeEmpty(): Box2;
    isEmpty(): boolean;
    getCenter(target: Vector2): Vector2;
    getSize(target: Vector2): Vector2;
    expandByPoint(point: Vector2Like): Box2;
    expandByVector(vector: Vector2): Box2;
    expandByScalar(scalar: number): Box2;
    containsPoint(point: Vector2): boolean;
    containsBox(box: Box2): boolean;
    getParameter(point: Vector2, target: Vector2): Vector2;
    intersectsBox(box: Box2): boolean;
    clampPoint(point: Vector2, target: Vector2): Vector2;
    distanceToPoint(point: Vector2): number;
    intersect(box: Box2): Box2;
    union(box: Box2): Box2;
    translate(offset: Vector2): Box2;
    equals(box: Box2): boolean;
    empty(): any;
    isIntersectionBox(b: any): any;
}
declare class ContextNodeInterface<TNodeType> extends Node$1 {
    readonly isContextNode: true;
    node: Node$1<TNodeType> | null;
    value: unknown;
}
declare const ContextNode: {
    new <TNodeType>(node?: Node$1<TNodeType> | null, value?: unknown): ContextNode<TNodeType>;
};
export type ContextNode<TNodeType> = ContextNodeInterface<TNodeType> & Node$1<TNodeType>;
export interface NodeExtensions<TNodeType> {
    context: (context?: unknown) => ContextNode<TNodeType>;
    label: (label: string) => Node$1<TNodeType>;
    uniformFlow: () => ContextNode<TNodeType>;
    setName: (label: string) => Node$1<TNodeType>;
    builtinShadowContext: (shadowNode: Node$1, light: Light) => ContextNode<TNodeType>;
    builtinAOContext: (aoValue: Node$1) => ContextNode<TNodeType>;
    builtinGIContext: (aoValue: Node$1, giValue: Node$1) => ContextNode<TNodeType>;
}
declare class BlendMode {
    blending: Blending;
    blendSrc: BlendingSrcFactor;
    blendDst: BlendingDstFactor;
    blendEquation: BlendingEquation;
    blendSrcAlpha: BlendingSrcFactor | null;
    blendDstAlpha: BlendingDstFactor | null;
    blendEquationAlpha: BlendingEquation | null;
    premultiplyAlpha: boolean;
    constructor(blending: Blending);
    copy(source: BlendMode): this;
    clone(): BlendMode;
}
declare class Color4 extends Color {
    a: number;
    constructor(r?: ColorRepresentation, g?: number, b?: number, a?: number);
    set(...args: [
        color: ColorRepresentation
    ] | [
        r: number,
        g: number,
        b: number,
        a?: number
    ]): this;
    copy(color: Color4): this;
    clone(): this;
    [Symbol.iterator](): Generator<number, void>;
}
export interface ArrayNodeInterface<TNodeType> {
    count: number;
    values: Node$1<TNodeType>[] | null;
    readonly isArrayNode: true;
}
declare const ArrayNode: {
    new <TNodeType>(nodeType: TNodeType | null, count: number, values?: Node$1<TNodeType>[] | null): ArrayNode<TNodeType>;
};
export type ArrayNode<TNodeType> = Node$1<TNodeType> & ArrayNodeInterface<TNodeType>;
export interface NodeExtensions<TNodeType> {
    toArray: (count: number) => ArrayNode<TNodeType>;
}
declare class BypassNode extends Node$1 {
    isBypassNode: true;
    outputNode: Node$1;
    callNode: Node$1;
    constructor(returnNode: Node$1, callNode: Node$1);
}
export interface NodeElements {
    bypass: (callNode: Node$1) => BypassNode;
}
export type Precision = "low" | "medium" | "high";
export interface InputNodeInterface<TValue> {
    isInputNode: true;
    value: TValue;
    precision: Precision | null;
    getInputType(builder: NodeBuilder): string | null;
    setPrecision(precision: Precision): this;
}
declare const InputNode: {
    new <TNodeType, TValue>(value: TValue, nodeType?: TNodeType | null): InputNode<TNodeType, TValue>;
};
export type InputNode<TNodeType, TValue> = Node$1<TNodeType> & InputNodeInterface<TValue>;
export interface NodeElements {
    toInspector: (name?: string, callback?: (node: this) => Node$1) => this;
}
declare class NodeCache {
    constructor(parent?: NodeCache | null);
    readonly id: number;
    nodesData: WeakMap<Node$1, unknown>;
    parent: NodeCache | null;
    getData(node: Node$1): unknown;
    setData(node: Node$1, data: unknown): void;
}
declare class IsolateNode extends Node$1 {
    node: Node$1;
    parent: boolean;
    readonly isIsolateNode: true;
    constructor(node: Node$1, parent?: boolean);
}
export interface NodeElements {
    cache: (cache?: NodeCache) => IsolateNode;
    isolate: () => IsolateNode;
}
declare abstract class LightingNode extends Node$1 {
    readonly isLightingNode: true;
    constructor();
}
export interface DirectLightData {
    lightDirection: Node$1;
    lightColor: Node$1;
}
export interface DirectRectAreaLightData {
    lightColor: Node$1;
    lightPosition: Node$1;
    halfWidth: Node$1;
    halfHeight: Node$1;
    ltc_1: Node$1;
    ltc_2: Node$1;
}
declare class LightsNode extends Node$1 {
    totalDiffuseNode: Node$1<"vec3">;
    totalSpecularNode: Node$1<"vec3">;
    outgoingLightNode: Node$1<"vec3">;
    constructor();
    setupLightsNode(builder: NodeBuilder): LightingNode[];
    setupDirectLight(builder: NodeBuilder, lightNode: Node$1, lightData: DirectLightData): void;
    setupDirectRectAreaLight(builder: NodeBuilder, lightNode: Node$1, lightData: DirectRectAreaLightData): void;
    setupLights(builder: NodeBuilder, lightNodes: LightingNode[]): void;
    getLightNodes(): LightingNode[];
    setLights(lights: Light[]): this;
    getLights(): Light[];
    getBuiltinLights(): Light[];
    get hasLights(): boolean;
}
export interface LightingModelReflectedLight {
    directDiffuse: Node$1;
    directSpecular: Node$1;
    indirectDiffuse: Node$1;
    indirectSpecular: Node$1;
}
export interface LightingModelDirectInput extends DirectLightData {
    lightNode: Node$1;
    reflectedLight: LightingModelReflectedLight;
}
export interface LightingModelDirectRectAreaInput extends DirectRectAreaLightData {
    lightNode: Node$1;
    reflectedLight: LightingModelReflectedLight;
}
declare class LightingModel {
    start(builder: NodeBuilder): void;
    finish(builder: NodeBuilder): void;
    direct(lightData: LightingModelDirectInput, builder: NodeBuilder): void;
    directRectArea(lightData: LightingModelDirectRectAreaInput, builder: NodeBuilder): void;
    indirect(builder: NodeBuilder): void;
    indirectDiffuse(builder: NodeBuilder): void;
    indirectSpecular(builder: NodeBuilder): void;
    ambientOcclusion(builder: NodeBuilder): void;
}
export interface FogJSON {
    type: string;
    name: string;
    color: number;
    near: number;
    far: number;
}
declare class Fog {
    constructor(color: ColorRepresentation, near?: number, far?: number);
    readonly isFog: boolean;
    name: string;
    color: Color;
    near: number;
    far: number;
    clone(): Fog;
    toJSON(): FogJSON;
}
export interface FogExp2JSON {
    type: string;
    name: string;
    color: number;
    density: number;
}
declare class FogExp2 {
    constructor(color: ColorRepresentation, density?: number);
    readonly isFogExp2: boolean;
    name: string;
    color: Color;
    density: number;
    clone(): FogExp2;
    toJSON(): FogExp2JSON;
}
export interface SceneJSONObject extends Object3DJSONObject {
    fog?: FogJSON | FogExp2JSON;
    backgroundBlurriness?: number;
    backgroundIntensity?: number;
    backgroundRotation: EulerTuple;
    environmentIntensity?: number;
    environmentRotation: EulerTuple;
}
export interface SceneJSON extends Object3DJSON {
    object: SceneJSONObject;
}
export class Scene<TEventMap extends Object3DEventMap = Object3DEventMap> extends Object3D<TEventMap> {
    readonly isScene: boolean;
    background: (Color | Texture) | null;
    environment: Texture | null;
    fog: (Fog | FogExp2) | null;
    backgroundBlurriness: number;
    backgroundIntensity: number;
    backgroundRotation: Euler;
    environmentIntensity: number;
    environmentRotation: Euler;
    overrideMaterial: Material | null;
    copy(source: Scene, recursive?: boolean): this;
    toJSON(meta?: JSONMeta): SceneJSON;
}
export type Matrix2Tuple = [
    n11: number,
    n12: number,
    n21: number,
    n22: number
];
declare class Matrix2 {
    readonly isMatrix2: true;
    elements: Matrix2Tuple;
    constructor();
    constructor(n11: number, n12: number, n21: number, n22: number);
    identity(): this;
    fromArray(array: ArrayLike<number>, offset?: number): this;
    set(n11: number, n12: number, n21: number, n22: number): this;
}
declare class UniformGroupNode extends Node$1 {
    name: string;
    version: number;
    shared: boolean;
    readonly isUniformGroup: true;
    constructor(name: string, shared?: boolean, order?: number, updateType?: NodeUpdateType | null);
    set needsUpdate(value: boolean);
}
export interface VarNodeInterface<TNode> {
    node: TNode;
    name: string | null;
    readonly isVarNode: true;
    readOnly: boolean;
    setAssignable(value: boolean): this;
    getAssignable(): boolean;
}
declare const VarNode: {
    new <TNodeType, TNode>(node: TNode, name?: string | null, readOnly?: boolean): VarNode<TNodeType, TNode>;
};
export type VarNode<TNodeType, TNode> = Node$1<TNodeType> & VarNodeInterface<TNode>;
export interface NodeExtensions<TNodeType> {
    toVar: (name?: string | null) => VarNode<TNodeType, this>;
    toConst: (name?: string | null) => VarNode<TNodeType, this>;
}
declare class UniformNodeClass<TValue> extends InputNode<unknown, TValue> {
    readonly isUniformNode: boolean;
    groupNode: UniformGroupNode;
    setName(name: string): this;
    label(name: string): this;
    setGroup(group: UniformGroupNode): this;
    getGroup(): UniformGroupNode;
    getUniformHash(builder: NodeBuilder): string;
    getSharedNode(builder: NodeBuilder): UniformNode<unknown, TValue>;
    onUpdate(callback: (this: this, frame: NodeFrame, self: this) => TValue | undefined, updateType: NodeUpdateType): this;
    getInputType(builder: NodeBuilder): string;
    generate(builder: NodeBuilder, output: string | null): string;
    onFrameUpdate(callback: (this: this, frame: NodeFrame, self: this) => TValue | undefined): this;
    onRenderUpdate(callback: (this: this, frame: NodeFrame, self: this) => TValue | undefined): this;
    onObjectUpdate(callback: (this: this, frame: NodeFrame, self: this) => TValue | undefined): this;
}
declare const UniformNode: {
    new <TNodeType, TValue = TNodeType extends keyof UniformValue ? UniformValue[TNodeType] : unknown>(value: TValue, nodeType?: string | null): UniformNode<TNodeType, TValue>;
};
export type UniformNode<TNodeType, TValue = TNodeType extends keyof UniformValue ? UniformValue[TNodeType] : unknown> = UniformNodeClass<TValue> & InputNode<TNodeType, TValue>;
export interface UniformValue {
    float: number;
    int: number;
    uint: number;
    bool: boolean;
    vec2: Vector2;
    ivec2: Vector2;
    uvec2: Vector2;
    vec3: Vector3;
    ivec3: Vector3;
    uvec3: Vector3;
    vec4: Vector4;
    ivec4: Vector4;
    uvec4: Vector4;
    mat2: Matrix2;
    mat3: Matrix3;
    mat4: Matrix4;
    color: Color;
}
declare class ComputeNode extends Node$1 {
    readonly isComputeNode: boolean;
    computeNode: Node$1;
    workgroupSize: number[];
    count: number | number[] | null;
    dispatchSize: number | number[] | null;
    name: string;
    onInitFunction: ((args: {
        renderer: Renderer;
    }) => void) | null;
    countNode: UniformNode<"uint"> | null;
    constructor(computeNode: Node$1, workgroupSize: number[]);
    setCount(count: number | number[]): this;
    getCount(): number | number[] | null;
    setName: (name: string) => this;
    label: (name: string) => this;
    onInit(callback: ((args: {
        renderer: Renderer;
    }) => void) | null): this;
}
export interface NodeElements {
    compute: (count: number, workgroupSize?: number[]) => ComputeNode;
    computeKernel: (workgroupSize?: number[]) => ComputeNode;
}
declare class NodeFrame {
    time: number;
    deltaTime: number;
    frameId: number;
    renderId: number;
    startTime: number | null;
    frameMap: WeakMap<Node$1, number>;
    frameBeforeMap: WeakMap<Node$1, number>;
    renderMap: WeakMap<Node$1, number>;
    renderBeforeMap: WeakMap<Node$1, number>;
    renderer: Renderer | null;
    material: Material | null;
    camera: Camera | null;
    object: Object3D | null;
    scene: Scene | null;
    compute: ComputeNode | null;
    constructor();
    updateBeforeNode(node: Node$1): void;
    updateNode(node: Node$1): void;
    update(): void;
}
declare class NodeVar {
    constructor(name: string, type: string, readOnly?: boolean, count?: number | null, local?: boolean);
    readonly isNodeVar: boolean;
    name: string;
    type: string;
    readOnly: boolean;
    local: boolean;
    count: number | null;
}
declare class NodeVarying extends NodeVar {
    constructor(name: string, type: string, interpolationType?: InterpolationSamplingType | null, interpolationSampling?: InterpolationSamplingMode | null);
    needsInterpolation: boolean;
    readonly isNodeVarying: boolean;
    interpolationType: InterpolationSamplingType | null;
    interpolationSampling: InterpolationSamplingMode | null;
}
declare class OutputStructNode extends Node$1 {
    members: Node$1[];
    readonly isOutputStructNode: true;
    constructor(...members: Node$1[]);
}
declare class OverrideContextNode extends ContextNode<unknown> {
    constructor(overrideNodes: Map<Node$1, (nodeBuilder: NodeBuilder) => Node$1>, flowNode?: Node$1 | null, shaderStage?: NodeShaderStage | null);
    readonly isOverrideContextNode: boolean;
}
export interface NodeElements {
    overrideNodes: (overrides: Map<Node$1, ((nodeBuilder: NodeBuilder) => Node$1) | Node$1 | null> | Array<[
        Node$1,
        ((nodeBuilder: NodeBuilder) => Node$1) | Node$1 | null
    ]>, shaderStage?: NodeShaderStage | null) => OverrideContextNode;
}
export interface VaryingNodeInterface {
    node: Node$1;
    name: string | null;
    readonly isVaryingNode: true;
    interpolationType: InterpolationSamplingType | null;
    interpolationSampling: InterpolationSamplingMode | null;
    setInterpolation(type: InterpolationSamplingType | null, sampling?: InterpolationSamplingMode | null): this;
    setupVarying(builder: NodeBuilder): NodeVarying;
}
declare const VaryingNode: {
    new <TNodeType>(node: Node$1<TNodeType>, name?: string | null): VaryingNode<TNodeType>;
};
export type VaryingNode<TNodeType> = VaryingNodeInterface & Node$1<TNodeType>;
export interface NodeExtensions<TNodeType> {
    toVarying: (name?: string) => VaryingNode<TNodeType>;
    toVertexStage: () => VaryingNode<TNodeType>;
}
export type ClippingNodeScope = typeof ClippingNode.ALPHA_TO_COVERAGE | typeof ClippingNode.DEFAULT;
declare class ClippingNode extends Node$1 {
    scope: ClippingNodeScope;
    hardwareClipping?: boolean;
    constructor(scope?: ClippingNodeScope);
    static ALPHA_TO_COVERAGE: "alphaToCoverage";
    static DEFAULT: "default";
    static HARDWARE: "hardware";
}
export interface ArrayElementNodeInterface<TNodeType> {
    node: ArrayNode<TNodeType>;
    indexNode: Node$1;
}
declare const ArrayElementNode: {
    new <TNodeType>(node: ArrayNode<TNodeType>, indexNode: Node$1): ArrayElementNode<TNodeType>;
};
export type ArrayElementNode<TNodeType> = Node$1<TNodeType> & ArrayElementNodeInterface<TNodeType>;
export interface ConvertNodeInterface {
    node: Node$1;
    convertTo: string;
}
declare const ConvertNode: {
    new <TNodeType>(node: Node$1, convertTo: string): ConvertNode<TNodeType>;
};
export type ConvertNode<TNodeType> = Node$1<TNodeType> & ConvertNodeInterface;
export interface NodeElements {
    assign: (sourceNode: Node$1 | number | boolean) => this;
    get: (value: string) => Node$1;
}
export interface NumOrBoolToJsType {
    float: number;
    int: number;
    uint: number;
    bool: boolean;
}
export type NumOrBool<TNumOrBool extends NumOrBoolType> = Node$1<TNumOrBool> | NumOrBoolToJsType[TNumOrBool];
export interface NumOrBoolToVec {
    float: "vec";
    int: "ivec";
    uint: "uvec";
    bool: "bvec";
}
export type NumOrBoolToVec2<TNumOrBool extends NumOrBoolType> = `${NumOrBoolToVec[TNumOrBool]}2`;
export type NumOrBoolToVec3<TNumOrBool extends NumOrBoolType> = `${NumOrBoolToVec[TNumOrBool]}3`;
export type NumOrBoolToVec4<TNumOrBool extends NumOrBoolType> = `${NumOrBoolToVec[TNumOrBool]}4`;
export interface Swizzle1From1<TNumOrBool extends NumOrBoolType> {
    get x(): Node$1<TNumOrBool>;
    set x(value: NumOrBool<TNumOrBool>);
    get r(): Node$1<TNumOrBool>;
    set r(value: NumOrBool<TNumOrBool>);
    get s(): Node$1<TNumOrBool>;
    set s(value: NumOrBool<TNumOrBool>);
}
export interface Swizzle1From2<TNumOrBool extends NumOrBoolType> extends Swizzle1From1<TNumOrBool> {
    get y(): Node$1<TNumOrBool>;
    set y(value: NumOrBool<TNumOrBool>);
    get g(): Node$1<TNumOrBool>;
    set g(value: NumOrBool<TNumOrBool>);
    get t(): Node$1<TNumOrBool>;
    set t(value: NumOrBool<TNumOrBool>);
}
export interface Swizzle1From3<TNumOrBool extends NumOrBoolType> extends Swizzle1From2<TNumOrBool> {
    get z(): Node$1<TNumOrBool>;
    set z(value: NumOrBool<TNumOrBool>);
    get b(): Node$1<TNumOrBool>;
    set b(value: NumOrBool<TNumOrBool>);
    get p(): Node$1<TNumOrBool>;
    set p(value: NumOrBool<TNumOrBool>);
}
export interface Swizzle1From4<TNumOrBool extends NumOrBoolType> extends Swizzle1From3<TNumOrBool> {
    get w(): Node$1<TNumOrBool>;
    set w(value: NumOrBool<TNumOrBool>);
    get a(): Node$1<TNumOrBool>;
    set a(value: NumOrBool<TNumOrBool>);
    get q(): Node$1<TNumOrBool>;
    set q(value: NumOrBool<TNumOrBool>);
}
export interface Swizzle2From1<TNumOrBool extends NumOrBoolType> {
    get xx(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get rr(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get ss(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
}
export interface Swizzle2From2<TNumOrBool extends NumOrBoolType> extends Swizzle2From1<TNumOrBool> {
    get xy(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set xy(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rg(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set rg(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get st(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set st(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yx(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set yx(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gr(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set gr(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ts(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ts(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yy(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get gg(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get tt(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
}
export interface Swizzle2From3<TNumOrBool extends NumOrBoolType> extends Swizzle2From2<TNumOrBool> {
    get xz(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set xz(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rb(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set rb(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get sp(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set sp(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yz(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set yz(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gb(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set gb(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tp(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set tp(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zx(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set zx(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get br(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set br(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ps(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ps(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zy(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set zy(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bg(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set bg(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pt(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set pt(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zz(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get bb(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get pp(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
}
export interface Swizzle2From4<TNumOrBool extends NumOrBoolType> extends Swizzle2From3<TNumOrBool> {
    get xw(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set xw(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ra(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ra(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get sq(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set sq(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yw(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set yw(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ga(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ga(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tq(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set tq(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zw(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set zw(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ba(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ba(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pq(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set pq(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wx(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set wx(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ar(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ar(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qs(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set qs(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wy(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set wy(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ag(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ag(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qt(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set qt(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wz(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set wz(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ab(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set ab(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qp(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    set qp(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ww(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get aa(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    get qq(): Node$1<NumOrBoolToVec2<TNumOrBool>>;
}
export interface Swizzle3From1<TNumOrBool extends NumOrBoolType> {
    get xxx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rrr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get sss(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
}
export interface Swizzle3From2<TNumOrBool extends NumOrBoolType> extends Swizzle3From1<TNumOrBool> {
    get xxy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rrg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get sst(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get xyx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rgr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get sts(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get xyy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rgg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get stt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yxx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get grr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get tss(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yxy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get grg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get tst(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yyx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ggr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get tts(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yyy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ggg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ttt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
}
export interface Swizzle3From3<TNumOrBool extends NumOrBoolType> extends Swizzle3From2<TNumOrBool> {
    get xxz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rrb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ssp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get xyz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set xyz(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rgb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set rgb(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get stp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set stp(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xzx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rbr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get sps(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get xzy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set xzy(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rbg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set rbg(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get spt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set spt(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xzz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rbb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get spp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yxz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set yxz(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get grb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set grb(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tsp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set tsp(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yyz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ggb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ttp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yzx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set yzx(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gbr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set gbr(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tps(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set tps(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yzy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get gbg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get tpt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yzz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get gbb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get tpp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zxx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get brr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get pss(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zxy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set zxy(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get brg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set brg(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pst(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set pst(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zxz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get brb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get psp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zyx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set zyx(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bgr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set bgr(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pts(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set pts(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zyy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get bgg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ptt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zyz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get bgb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ptp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zzx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get bbr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get pps(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zzy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get bbg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ppt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zzz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get bbb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ppp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
}
export interface Swizzle3From4<TNumOrBool extends NumOrBoolType> extends Swizzle3From3<TNumOrBool> {
    get xxw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rra(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ssq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get xyw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set xyw(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rga(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set rga(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get stq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set stq(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xzw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set xzw(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rba(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set rba(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get spq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set spq(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xwx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get rar(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get sqs(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get xwy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set xwy(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rag(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set rag(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get sqt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set sqt(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xwz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set xwz(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rab(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set rab(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get sqp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set sqp(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xww(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get raa(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get sqq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yxw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set yxw(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gra(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set gra(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tsq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set tsq(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yyw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get gga(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ttq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get yzw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set yzw(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gba(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set gba(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tpq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set tpq(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ywx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set ywx(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gar(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set gar(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tqs(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set tqs(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ywy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get gag(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get tqt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ywz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set ywz(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gab(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set gab(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tqp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set tqp(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yww(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get gaa(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get tqq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zxw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set zxw(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bra(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set bra(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get psq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set psq(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zyw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set zyw(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bga(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set bga(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ptq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set ptq(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zzw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get bba(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ppq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zwx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set zwx(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bar(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set bar(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pqs(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set pqs(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zwy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set zwy(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bag(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set bag(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pqt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set pqt(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zwz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get bab(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get pqp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get zww(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get baa(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get pqq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wxx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get arr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qss(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wxy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set wxy(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get arg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set arg(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qst(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set qst(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wxz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set wxz(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get arb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set arb(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qsp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set qsp(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wxw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get ara(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qsq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wyx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set wyx(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get agr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set agr(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qts(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set qts(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wyy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get agg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qtt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wyz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set wyz(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get agb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set agb(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qtp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set qtp(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wyw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get aga(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qtq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wzx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set wzx(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get abr(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set abr(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qps(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set qps(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wzy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set wzy(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get abg(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set abg(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qpt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    set qpt(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wzz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get abb(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qpp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wzw(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get aba(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qpq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wwx(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get aar(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qqs(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wwy(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get aag(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qqt(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get wwz(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get aab(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qqp(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get www(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get aaa(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    get qqq(): Node$1<NumOrBoolToVec3<TNumOrBool>>;
}
export interface Swizzle4From1<TNumOrBool extends NumOrBoolType> {
    get xxxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
}
export interface Swizzle4From2<TNumOrBool extends NumOrBoolType> extends Swizzle4From1<TNumOrBool> {
    get xxxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrgr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrgg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sstt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rggr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rggg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sttt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tsss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tsst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grgr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tsts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grgg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tstt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gggr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gggg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tttt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
}
export interface Swizzle4From3<TNumOrBool extends NumOrBoolType> extends Swizzle4From2<TNumOrBool> {
    get xxxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sssp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrgb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sstp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sspt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sspp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rggb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sttp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbgr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbgg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sptt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbgb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sptp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sppt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sppp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tssp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grgb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tstp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tsps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tspt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tspp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gggb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tttp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbgr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbgg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tptt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbgb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tptp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tppt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tppp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get psss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get psst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pssp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brgr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get psts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brgg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pstt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brgb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pstp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get psps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pspt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pspp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bggr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bggg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pttt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bggb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pttp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbgr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbgg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pptt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbgb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pptp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pppt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pppp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
}
export interface Swizzle4From4<TNumOrBool extends NumOrBoolType> extends Swizzle4From3<TNumOrBool> {
    get xxxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sssq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sstq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sspq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rrab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xxww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rraa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ssqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sttq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xyzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set xyzw(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rgba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set rgba(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get stpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set stpq(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xywx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xywy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xywz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set xywz(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rgab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set rgab(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get stqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set stqp(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xyww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rgaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get stqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set xzyw(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rbga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set rbga(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get sptq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set sptq(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xzzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sppq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set xzwy(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rbag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set rbag(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get spqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set spqt(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xzwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xzww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rbaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get spqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rarr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rarg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rarb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rara(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ragr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ragg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqtt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set xwyz(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ragb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set ragb(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get sqtp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set sqtp(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xwyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get raga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqtq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rabr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set xwzy(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get rabg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set rabg(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get sqpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set sqpt(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get xwzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get rabb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get raba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get raar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get raag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get raab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get xwww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get raaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get sqqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tssq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tstq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set yxzw(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get grba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set grba(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tspq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set tspq(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yxwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tsqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get grag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tsqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yxwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set yxwz(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get grab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set grab(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tsqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set tsqp(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yxww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get graa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tsqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tttq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yywx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yywy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yywz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yyww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ggaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ttqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set yzxw(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gbra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set gbra(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tpsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set tpsq(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yzyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tptq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tppq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set yzwx(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gbar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set gbar(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tpqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set tpqs(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get yzwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get yzww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gbaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tpqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get garr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get garg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set ywxz(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get garb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set garb(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tqsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set tqsp(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ywxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gara(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gagr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gagg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqtt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gagb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqtp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gaga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqtq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set ywzx(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get gabr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set gabr(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get tqps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set tqps(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ywzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gabg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gabb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gaba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gaar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gaag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gaab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ywww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get gaaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get tqqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pssq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set zxyw(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get brga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set brga(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pstq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set pstq(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zxzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pspq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get psqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set zxwy(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get brag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set brag(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get psqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set psqt(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zxwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get brab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get psqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zxww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get braa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get psqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set zyxw(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bgra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set bgra(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ptsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set ptsq(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zyyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pttq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zywx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set zywx(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bgar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set bgar(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get ptqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set ptqs(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zywy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zywz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zyww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bgaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ptqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pptq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pppq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zzww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bbaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get ppqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get barr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set zwxy(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get barg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set barg(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pqst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set pqst(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zwxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get barb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bara(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set zwyx(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get bagr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set bagr(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get pqts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set pqts(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get zwyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bagg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqtt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get bagb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqtp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get baga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqtq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get babr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get babg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get babb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get baba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get baar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get baag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get baab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get zwww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get baaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get pqqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qssp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qssq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get argr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get argg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qstt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set wxyz(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get argb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set argb(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qstp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set qstp(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wxyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qstq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set wxzy(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get arbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set arbg(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qspt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set qspt(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wxzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qspp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qspq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get arab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wxww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get araa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qsqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set wyxz(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get agrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set agrb(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qtsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set qtsp(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wyxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aggr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aggg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qttt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aggb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qttp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qttq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set wyzx(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get agbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set agbr(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qtps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set qtps(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wyzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wywx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wywy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wywz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wyww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get agaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qtqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abrr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set wzxy(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get abrg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set abrg(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qpst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set qpst(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wzxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abrb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abra(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set wzyx(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get abgr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set abgr(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get qpts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    set qpts(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>);
    get wzyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abgg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qptt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abgb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qptp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qptq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abbr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abbg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qppt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abbb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qppp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qppq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wzww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get abaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qpqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwxx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aarr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqss(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwxy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aarg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqst(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwxz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aarb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqsp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwxw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aara(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqsq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwyx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aagr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqts(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwyy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aagg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqtt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwyz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aagb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqtp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwyw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aaga(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqtq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwzx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aabr(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqps(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwzy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aabg(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqpt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwzz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aabb(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqpp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwzw(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aaba(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqpq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwwx(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aaar(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqqs(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwwy(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aaag(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqqt(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwwz(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aaab(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqqp(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get wwww(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get aaaa(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    get qqqq(): Node$1<NumOrBoolToVec4<TNumOrBool>>;
}
export interface NumOrBoolExtensions<TNumOrBool extends NumOrBoolType> extends Swizzle1From1<TNumOrBool>, Swizzle2From1<TNumOrBool>, Swizzle3From1<TNumOrBool>, Swizzle4From1<TNumOrBool> {
}
export interface NumOrBoolVec2Extensions<TNumOrBool extends NumOrBoolType> extends Swizzle1From2<TNumOrBool>, Swizzle2From2<TNumOrBool>, Swizzle3From2<TNumOrBool>, Swizzle4From2<TNumOrBool> {
}
export interface NumOrBoolVec3Extensions<TNumOrBool extends NumOrBoolType> extends Swizzle1From3<TNumOrBool>, Swizzle2From3<TNumOrBool>, Swizzle3From3<TNumOrBool>, Swizzle4From3<TNumOrBool> {
}
export interface ColorExtensions extends Swizzle1From3<"float">, Swizzle2From3<"float">, Swizzle3From3<"float">, Swizzle4From3<"float"> {
}
export interface NumOrBoolVec4Extensions<TNumOrBool extends NumOrBoolType> extends Swizzle1From4<TNumOrBool>, Swizzle2From4<TNumOrBool>, Swizzle3From4<TNumOrBool>, Swizzle4From4<TNumOrBool> {
}
export interface SetSwizzle1<TNumOrBool extends NumOrBoolType> {
    setX(value: NumOrBool<TNumOrBool>): Node$1<TNumOrBool>;
    setR(value: NumOrBool<TNumOrBool>): Node$1<TNumOrBool>;
    setS(value: NumOrBool<TNumOrBool>): Node$1<TNumOrBool>;
}
export interface SetSwizzle2<TNumOrBool extends NumOrBoolType> {
    setX(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setR(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setS(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setY(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setG(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setT(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setXY(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setRG(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
    setST(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec2<TNumOrBool>>;
}
export interface SetSwizzle3<TNumOrBool extends NumOrBoolType> {
    setX(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setR(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setS(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setY(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setG(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setT(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setZ(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setB(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setP(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setXY(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setRG(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setST(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setYZ(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setGB(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setTP(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setXYZ(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setRGB(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
    setSTP(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec3<TNumOrBool>>;
}
export interface SetSwizzle4<TNumOrBool extends NumOrBoolType> {
    setX(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setR(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setS(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setY(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setG(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setT(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setZ(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setB(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setP(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setW(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setA(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setQ(value: NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setXY(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setRG(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setST(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setYZ(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setGB(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setTP(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setZW(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setBA(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setPQ(value: Node$1<NumOrBoolToVec2<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setXYZ(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setRGB(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setSTP(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setYZW(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setGBA(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setTPQ(value: Node$1<NumOrBoolToVec3<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setXYZW(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setRGBA(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
    setSTPQ(value: Node$1<NumOrBoolToVec4<TNumOrBool>> | NumOrBool<TNumOrBool>): Node$1<NumOrBoolToVec4<TNumOrBool>>;
}
export interface NumOrBoolExtensions<TNumOrBool extends NumOrBoolType> extends SetSwizzle1<TNumOrBool> {
}
export interface NumOrBoolVec2Extensions<TNumOrBool extends NumOrBoolType> extends SetSwizzle2<TNumOrBool> {
}
export interface NumOrBoolVec3Extensions<TNumOrBool extends NumOrBoolType> extends SetSwizzle3<TNumOrBool> {
}
export interface ColorExtensions extends SetSwizzle3<"float"> {
}
export interface NumOrBoolVec4Extensions<TNumOrBool extends NumOrBoolType> extends SetSwizzle4<TNumOrBool> {
}
export interface FlipSwizzle1 {
    flipX(): Node$1<"float">;
    flipR(): Node$1<"float">;
    flipS(): Node$1<"float">;
}
export interface FlipSwizzle2 {
    flipX(): Node$1<"vec2">;
    flipR(): Node$1<"vec2">;
    flipS(): Node$1<"vec2">;
    flipY(): Node$1<"vec2">;
    flipG(): Node$1<"vec2">;
    flipT(): Node$1<"vec2">;
    flipXY(): Node$1<"vec2">;
    flipRG(): Node$1<"vec2">;
    flipST(): Node$1<"vec2">;
}
export interface FlipSwizzle3 {
    flipX(): Node$1<"vec3">;
    flipR(): Node$1<"vec3">;
    flipS(): Node$1<"vec3">;
    flipY(): Node$1<"vec3">;
    flipG(): Node$1<"vec3">;
    flipT(): Node$1<"vec3">;
    flipZ(): Node$1<"vec3">;
    flipB(): Node$1<"vec3">;
    flipP(): Node$1<"vec3">;
    flipXY(): Node$1<"vec3">;
    flipRG(): Node$1<"vec3">;
    flipST(): Node$1<"vec3">;
    flipXZ(): Node$1<"vec3">;
    flipRB(): Node$1<"vec3">;
    flipSP(): Node$1<"vec3">;
    flipYZ(): Node$1<"vec3">;
    flipGB(): Node$1<"vec3">;
    flipTP(): Node$1<"vec3">;
    flipXYZ(): Node$1<"vec3">;
    flipRGB(): Node$1<"vec3">;
    flipSTP(): Node$1<"vec3">;
}
export interface FlipSwizzle4 {
    flipX(): Node$1<"vec4">;
    flipR(): Node$1<"vec4">;
    flipS(): Node$1<"vec4">;
    flipY(): Node$1<"vec4">;
    flipG(): Node$1<"vec4">;
    flipT(): Node$1<"vec4">;
    flipZ(): Node$1<"vec4">;
    flipB(): Node$1<"vec4">;
    flipP(): Node$1<"vec4">;
    flipW(): Node$1<"vec4">;
    flipA(): Node$1<"vec4">;
    flipQ(): Node$1<"vec4">;
    flipXY(): Node$1<"vec4">;
    flipRG(): Node$1<"vec4">;
    flipST(): Node$1<"vec4">;
    flipXZ(): Node$1<"vec4">;
    flipRB(): Node$1<"vec4">;
    flipSP(): Node$1<"vec4">;
    flipYZ(): Node$1<"vec4">;
    flipGB(): Node$1<"vec4">;
    flipTP(): Node$1<"vec4">;
    flipXW(): Node$1<"vec4">;
    flipRA(): Node$1<"vec4">;
    flipSQ(): Node$1<"vec4">;
    flipYW(): Node$1<"vec4">;
    flipGA(): Node$1<"vec4">;
    flipTQ(): Node$1<"vec4">;
    flipZW(): Node$1<"vec4">;
    flipBA(): Node$1<"vec4">;
    flipPQ(): Node$1<"vec4">;
    flipXYZ(): Node$1<"vec4">;
    flipRGB(): Node$1<"vec4">;
    flipSTP(): Node$1<"vec4">;
    flipXYW(): Node$1<"vec4">;
    flipRGA(): Node$1<"vec4">;
    flipSTQ(): Node$1<"vec4">;
    flipXZW(): Node$1<"vec4">;
    flipRBA(): Node$1<"vec4">;
    flipSPQ(): Node$1<"vec4">;
    flipYZW(): Node$1<"vec4">;
    flipGBA(): Node$1<"vec4">;
    flipTPQ(): Node$1<"vec4">;
    flipXYZW(): Node$1<"vec4">;
    flipRGBA(): Node$1<"vec4">;
    flipSTPQ(): Node$1<"vec4">;
}
export interface FloatExtensions extends FlipSwizzle1 {
}
export interface Vec2Extensions extends FlipSwizzle2 {
}
export interface Vec3Extensions extends FlipSwizzle3 {
}
export interface ColorExtensions extends FlipSwizzle3 {
}
export interface Vec4Extensions extends FlipSwizzle4 {
}
export interface NodeElements {
    toStack: () => Node$1;
}
export interface ColorExtensions {
    toColor: () => ConvertNode<"color">;
}
export interface NumOrBoolExtensions<TNumOrBool extends NumOrBoolType> {
    toFloat: () => ConvertNode<"float">;
    toInt: () => ConvertNode<"int">;
    toUint: () => ConvertNode<"uint">;
    toBool: () => ConvertNode<"bool">;
}
export interface NumOrBoolVec2Extensions<TNumOrBool extends NumOrBoolType> {
    toVec2: () => ConvertNode<"vec2">;
    toIVec2: () => ConvertNode<"ivec2">;
    toUVec2: () => ConvertNode<"uvec2">;
    toBVec2: () => ConvertNode<"bvec2">;
}
export interface NumOrBoolVec3Extensions<TNumOrBool extends NumOrBoolType> {
    toColor: () => ConvertNode<"color">;
    toVec3: () => ConvertNode<"vec3">;
    toIVec3: () => ConvertNode<"ivec3">;
    toUVec3: () => ConvertNode<"uvec3">;
    toBVec3: () => ConvertNode<"bvec3">;
}
export interface NumOrBoolVec4Extensions<TNumOrBool extends NumOrBoolType> {
    toVec4: () => ConvertNode<"vec4">;
    toIVec4: () => ConvertNode<"ivec4">;
    toUVec4: () => ConvertNode<"uvec4">;
    toBVec4: () => ConvertNode<"bvec4">;
}
export interface MatExtensions<TMat extends MatType> {
    toMat2: () => ConvertNode<"mat2">;
    toMat3: () => ConvertNode<"mat3">;
    toMat4: () => ConvertNode<"mat4">;
}
export interface ArrayNodeInterface<TNodeType> {
    element: (indexNode: Node$1 | number) => ArrayElementNode<TNodeType>;
}
export interface NodeElements {
    convert: (types: string) => Node$1;
}
export type WorkingOrOutputColorSpace = "WorkingColorSpace" | "OutputColorSpace";
declare class ColorSpaceNode extends Node$1<"vec4"> {
    colorNode: Node$1;
    source: string;
    target: string;
    constructor(colorNode: Node$1, source: string, target: string);
    resolveColorSpace(nodeBuilder: NodeBuilder, colorSpace: WorkingOrOutputColorSpace): string;
}
export interface NodeElements {
    workingToColorSpace: (targetColorSpace: string) => ColorSpaceNode;
    colorSpaceToWorking: (sourceColorSpace: string) => ColorSpaceNode;
}
declare class Layers {
    constructor();
    mask: number;
    set(layer: number): void;
    enable(layer: number): void;
    enableAll(): void;
    toggle(layer: number): void;
    disable(layer: number): void;
    disableAll(): void;
    test(layers: Layers): boolean;
    isEnabled(layer: number): boolean;
}
declare class Lighting {
    enabled: boolean;
    createNode(lights?: Array<Light>): LightsNode;
    getNode(scene: Scene): LightsNode;
    beginRender(scene: Scene): void;
    finishRender(scene: Scene): void;
    dispose(): void;
}
declare class RenderOutputNode extends Node$1<"vec4"> {
    colorNode: Node$1;
    outputColorSpace: string | null;
    premultipliedAlpha: boolean;
    readonly isRenderOutput: true;
    constructor(colorNode: Node$1, toneMapping?: ToneMapping | null, outputColorSpace?: string | null);
}
export interface NodeElements {
    renderOutput: (toneMapping?: ToneMapping | null, outputColorSpace?: string | null) => RenderOutputNode;
}
declare class ToneMappingNode extends Node$1<"vec3"> {
    exposureNode: Node$1;
    colorNode: Node$1 | null;
    constructor(toneMapping: ToneMapping, exposureNode?: Node$1, colorNode?: Node$1 | null);
}
export interface NodeElements {
    toneMapping: (mapping?: ToneMapping, exposure?: Node$1 | number) => ToneMappingNode;
}
declare class FramebufferTexture extends Texture<FramebufferTextureImageData> {
    constructor(width: number, height: number);
    readonly isFramebufferTexture: true;
    magFilter: MagnificationTextureFilter;
    minFilter: MinificationTextureFilter;
    generateMipmaps: boolean;
}
export interface FramebufferTextureImageData {
    width: number;
    height: number;
}
export interface CanvasTargetEventMap {
    resize: {};
    dispose: {};
}
declare class CanvasTarget<TEventMap extends CanvasTargetEventMap = CanvasTargetEventMap> extends EventDispatcher<TEventMap> {
    constructor(domElement: HTMLCanvasElement | OffscreenCanvas);
    domElement: HTMLCanvasElement | OffscreenCanvas;
    colorTexture: FramebufferTexture;
    depthTexture: DepthTexture;
    getPixelRatio(): number;
    getDrawingBufferSize(target: Vector2): Vector2;
    getSize(target: Vector2): Vector2;
    setPixelRatio(value?: number): void;
    setDrawingBufferSize(width: number, height: number, pixelRatio: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    getScissor(target: Vector4): Vector4;
    setScissor(x: Vector4): void;
    setScissor(x: number, y: number, width: number, height: number): void;
    getScissorTest(): boolean;
    setScissorTest(boolean: boolean): void;
    getViewport(target: Vector4): Vector4;
    setViewport(x: Vector4): void;
    setViewport(x: number, y: number, width: number, height: number, minDepth?: number, maxDepth?: number): void;
    dispose(): void;
}
export class AmbientLight extends Light {
    constructor(color?: ColorRepresentation, intensity?: number);
    readonly isAmbientLight: boolean;
}
export interface OrthographicCameraJSONObject extends Object3DJSONObject {
    zoom: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    view?: {
        enabled: boolean;
        fullWidth: number;
        fullHeight: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    };
}
export interface OrthographicCameraJSON extends Object3DJSON {
    object: OrthographicCameraJSONObject;
}
export class OrthographicCamera extends Camera {
    constructor(left?: number, right?: number, top?: number, bottom?: number, near?: number, far?: number);
    readonly isOrthographicCamera: boolean;
    zoom: number;
    view: {
        enabled: boolean;
        fullWidth: number;
        fullHeight: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    } | null;
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
    copy(source: OrthographicCamera, recursive?: boolean): this;
    setViewOffset(fullWidth: number, fullHeight: number, x: number, y: number, width: number, height: number): void;
    clearViewOffset(): void;
    updateProjectionMatrix(): void;
    toJSON(meta?: JSONMeta): OrthographicCameraJSON;
}
export interface LineBasicMaterialProperties extends MaterialProperties {
    color: Color;
    map: Texture | null;
    linewidth: number;
    linecap: "butt" | "round" | "square";
    linejoin: "round" | "bevel" | "miter";
    fog: boolean;
}
export interface LineBasicMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<LineBasicMaterialProperties>> {
}
export class LineBasicMaterial extends Material {
    constructor(parameters?: LineBasicMaterialParameters);
    readonly isLineBasicMaterial: boolean;
    setValues(values?: LineBasicMaterialParameters): void;
}
export interface LineBasicMaterial extends LineBasicMaterialProperties {
}
export interface LineDashedMaterialProperties extends LineBasicMaterialProperties {
    scale: number;
    dashSize: number;
    gapSize: number;
}
export interface LineDashedMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<LineDashedMaterialProperties>> {
}
export class LineDashedMaterial extends LineBasicMaterial {
    constructor(parameters?: LineDashedMaterialParameters);
    readonly isLineDashedMaterial: boolean;
    setValues(values?: LineDashedMaterialParameters): void;
}
export interface LineDashedMaterial extends LineDashedMaterialProperties {
}
export interface MeshBasicMaterialProperties extends MaterialProperties {
    color: Color;
    map: Texture | null;
    lightMap: Texture | null;
    lightMapIntensity: number;
    aoMap: Texture | null;
    aoMapIntensity: number;
    specularMap: Texture | null;
    alphaMap: Texture | null;
    envMap: Texture | null;
    envMapRotation: Euler;
    combine: Combine;
    reflectivity: number;
    refractionRatio: number;
    wireframe: boolean;
    wireframeLinewidth: number;
    wireframeLinecap: "round" | "bevel" | "miter";
    wireframeLinejoin: "round" | "bevel" | "miter";
    fog: boolean;
}
export interface MeshBasicMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<MeshBasicMaterialProperties>> {
}
export class MeshBasicMaterial extends Material {
    constructor(parameters?: MeshBasicMaterialParameters);
    readonly isMeshBasicMaterial: boolean;
    setValues(values?: MeshBasicMaterialParameters): void;
}
export interface MeshBasicMaterial extends MeshBasicMaterialProperties {
}
export interface MeshStandardMaterialProperties extends MaterialProperties {
    color: Color;
    roughness: number;
    metalness: number;
    map: Texture | null;
    lightMap: Texture | null;
    lightMapIntensity: number;
    aoMap: Texture | null;
    aoMapIntensity: number;
    emissive: Color;
    emissiveIntensity: number;
    emissiveMap: Texture | null;
    bumpMap: Texture | null;
    bumpScale: number;
    normalMap: Texture | null;
    normalMapType: NormalMapTypes;
    normalScale: Vector2;
    displacementMap: Texture | null;
    displacementScale: number;
    displacementBias: number;
    roughnessMap: Texture | null;
    metalnessMap: Texture | null;
    alphaMap: Texture | null;
    envMap: Texture | null;
    envMapRotation: Euler;
    envMapIntensity: number;
    wireframe: boolean;
    wireframeLinewidth: number;
    wireframeLinecap: "round" | "bevel" | "miter";
    wireframeLinejoin: "round" | "bevel" | "miter";
    flatShading: boolean;
    fog: boolean;
}
export interface MeshStandardMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<MeshStandardMaterialProperties>> {
}
export class MeshStandardMaterial extends Material {
    constructor(parameters?: MeshStandardMaterialParameters);
    readonly isMeshStandardMaterial: boolean;
    setValues(values?: MeshStandardMaterialParameters): void;
}
export interface MeshStandardMaterial extends MeshStandardMaterialProperties {
}
export interface PointsMaterialProperties extends MaterialProperties {
    color: Color;
    map: Texture | null;
    alphaMap: Texture | null;
    size: number;
    sizeAttenuation: boolean;
    fog: boolean;
}
export interface PointsMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<PointsMaterialProperties>> {
}
export class PointsMaterial extends Material {
    constructor(parameters?: PointsMaterialParameters);
    readonly isPointsMaterial: boolean;
    setValues(values?: PointsMaterialParameters): void;
}
export interface PointsMaterial extends PointsMaterialProperties {
}
declare class Uniform<T = any> {
    constructor(value: T);
    value: T;
    clone(): Uniform<T>;
}
export interface UniformsGroupEventMap {
    dispose: {};
}
declare class UniformsGroup<TEventMap extends UniformsGroupEventMap = UniformsGroupEventMap> extends EventDispatcher<TEventMap> {
    constructor();
    readonly isUniformsGroup: true;
    id: number;
    usage: Usage;
    uniforms: Array<Uniform | Uniform[]>;
    add(uniform: Uniform | Uniform[]): this;
    remove(uniform: Uniform | Uniform[]): this;
    setName(name: string): this;
    setUsage(value: Usage): this;
    dispose(): void;
    copy(source: UniformsGroup): this;
    clone(): UniformsGroup;
}
export interface IUniform<TValue = any> {
    value: TValue;
}
export interface ShaderMaterialProperties extends MaterialProperties {
    defines: Record<string, unknown>;
    uniforms: {
        [uniform: string]: IUniform;
    };
    uniformsGroups: Array<UniformsGroup>;
    vertexShader: string;
    fragmentShader: string;
    linewidth: number;
    wireframe: boolean;
    wireframeLinewidth: number;
    fog: boolean;
    lights: boolean;
    clipping: boolean;
    extensions: {
        clipCullDistance: boolean;
        multiDraw: boolean;
    };
    defaultAttributeValues: {
        color: [
            number,
            number,
            number
        ];
        uv: [
            number,
            number
        ];
        uv1: [
            number,
            number
        ];
    };
    index0AttributeName: string | undefined;
    uniformsNeedUpdate: boolean;
    glslVersion: GLSLVersion | null;
}
export interface ShaderMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<ShaderMaterialProperties>> {
}
export type ShaderMaterialUniformJSON = {
    type: "t";
    value: string;
} | {
    type: "c";
    value: number;
} | {
    type: "v2";
    value: Vector2Tuple;
} | {
    type: "v3";
    value: Vector3Tuple;
} | {
    type: "v4";
    value: Vector4Tuple;
} | {
    type: "m3";
    value: Matrix3Tuple;
} | {
    type: "m4";
    value: Matrix4Tuple;
} | {
    value: unknown;
};
export interface ShaderMaterialJSON extends MaterialJSON {
    glslVersion: number | null;
    uniforms: Record<string, ShaderMaterialUniformJSON>;
    defines?: Record<string, unknown>;
    vertexShader: string;
    fragmentShader: string;
    lights: boolean;
    clipping: boolean;
    extensions?: Record<string, boolean>;
}
export class ShaderMaterial extends Material {
    constructor(parameters?: ShaderMaterialParameters);
    readonly isShaderMaterial: boolean;
    setValues(values?: ShaderMaterialParameters): void;
    toJSON(meta?: JSONMeta): ShaderMaterialJSON;
    fromJSON(json: MaterialJSON, textures: Record<string, Texture>): this;
}
export interface ShaderMaterial extends ShaderMaterialProperties {
    defines: Record<string, unknown>;
}
export interface SpriteMaterialProperties extends MaterialProperties {
    color: Color;
    map: Texture | null;
    alphaMap: Texture | null;
    rotation: number;
    sizeAttenuation: boolean;
    fog: boolean;
}
export interface SpriteMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<SpriteMaterialProperties>> {
}
declare class SpriteMaterial extends Material {
    constructor(parameters?: SpriteMaterialParameters);
    readonly isSpriteMaterial: boolean;
    setValues(values?: SpriteMaterialParameters): void;
}
export interface SpriteMaterial extends SpriteMaterialProperties {
}
export interface PerspectiveCameraJSONObject extends Object3DJSONObject {
    fov: number;
    zoom: number;
    near: number;
    far: number;
    focus: number;
    aspect: number;
    view?: {
        enabled: boolean;
        fullWidth: number;
        fullHeight: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    };
    filmGauge: number;
    filmOffset: number;
}
export interface PerspectiveCameraJSON extends Object3DJSON {
    object: PerspectiveCameraJSONObject;
}
declare class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    readonly isPerspectiveCamera: boolean;
    fov: number;
    zoom: number;
    near: number;
    far: number;
    focus: number;
    aspect: number;
    view: {
        enabled: boolean;
        fullWidth: number;
        fullHeight: number;
        offsetX: number;
        offsetY: number;
        width: number;
        height: number;
    } | null;
    filmGauge: number;
    filmOffset: number;
    copy(source: PerspectiveCamera, recursive?: boolean): this;
    setFocalLength(focalLength: number): void;
    getFocalLength(): number;
    getEffectiveFOV(): number;
    getFilmWidth(): number;
    getFilmHeight(): number;
    getViewBounds(distance: number, minTarget: Vector2, maxTarget: Vector2): void;
    getViewSize(distance: number, target: Vector2): Vector2;
    setViewOffset(fullWidth: number, fullHeight: number, x: number, y: number, width: number, height: number): void;
    clearViewOffset(): void;
    updateProjectionMatrix(): void;
    toJSON(meta?: JSONMeta): PerspectiveCameraJSON;
}
declare class ArrayCamera extends PerspectiveCamera {
    constructor(array?: PerspectiveCamera[]);
    readonly isArrayCamera: boolean;
    readonly isMultiViewCamera: boolean;
    cameras: PerspectiveCamera[];
    perCameraFrustumCulled: boolean;
}
declare class FrustumArray {
    coordinateSystem: CoordinateSystem;
    setFromArrayCamera(cameraArray: ArrayCamera): FrustumArray;
    getFrustum(index: number): Frustum | undefined;
    intersectsObject(object: Object3D): boolean;
    intersectsSprite(sprite: Sprite): boolean;
    intersectsSphere(sphere: Sphere): boolean;
    intersectsBox(box: Box3): boolean;
    containsPoint(point: Vector3): boolean;
    copy(source: FrustumArray): this;
    clone(): FrustumArray;
}
export interface SpriteJSONObject extends Object3DJSONObject {
    center: Vector2Tuple;
}
export interface SpriteJSON extends Object3DJSON {
    object: SpriteJSONObject;
}
declare class Sprite<TEventMap extends Object3DEventMap = Object3DEventMap> extends Object3D<TEventMap> {
    constructor(material?: SpriteMaterial);
    readonly isSprite: true;
    override readonly type: string | "Sprite";
    override castShadow: false;
    geometry: BufferGeometry;
    material: SpriteMaterial;
    center: Vector2;
    count: number;
    intersectsFrustum(frustum: Frustum | FrustumArray): boolean;
    toJSON(meta?: JSONMeta): SpriteJSON;
}
declare class Frustum {
    constructor(p0?: Plane, p1?: Plane, p2?: Plane, p3?: Plane, p4?: Plane, p5?: Plane);
    planes: Plane[];
    set(p0: Plane, p1: Plane, p2: Plane, p3: Plane, p4: Plane, p5: Plane): Frustum;
    clone(): this;
    copy(frustum: Frustum): this;
    setFromProjectionMatrix(m: Matrix4, coordinateSystem?: CoordinateSystem, reversedDepth?: boolean): this;
    intersectsObject(object: Object3D): boolean;
    intersectsSprite(sprite: Sprite): boolean;
    intersectsSphere(sphere: Sphere): boolean;
    intersectsBox(box: Box3): boolean;
    containsPoint(point: Vector3): boolean;
}
export interface LightShadowJSON {
    intensity?: number;
    bias?: number;
    normalBias?: number;
    radius?: number;
    blurSamples?: number;
    mapSize?: Vector2Tuple;
    mapType?: TextureDataType;
    camera: Omit<Object3DJSONObject, "matrix">;
}
declare abstract class LightShadow<TCamera extends Camera = Camera> {
    constructor(camera: TCamera);
    camera: TCamera;
    intensity: number;
    bias: number;
    biasNode: Node$1<"float"> | null;
    normalBias: number;
    radius: number;
    blurSamples: number;
    mapSize: Vector2;
    mapType: TextureDataType;
    map: RenderTarget | null;
    mapPass: RenderTarget | null;
    matrix: Matrix4;
    autoUpdate: boolean;
    needsUpdate: boolean;
    getViewportCount(): number;
    getCamera(viewportIndex?: number): TCamera;
    getFrustum(): Frustum;
    updateMatrices(light: Light): void;
    getViewport(viewportIndex: number): Vector4;
    getFrameExtents(): Vector2;
    dispose(): void;
    copy(source: LightShadow): this;
    clone(): this;
    toJSON(): LightShadowJSON;
}
declare class DirectionalLightShadow extends LightShadow<OrthographicCamera> {
    constructor();
    readonly isDirectionalLightShadow: boolean;
}
export interface DirectionalLightJSON extends LightJSON {
    shadow: LightShadowJSON;
    target: string;
}
export class DirectionalLight extends Light {
    constructor(color?: ColorRepresentation, intensity?: number);
    readonly isDirectionalLight: boolean;
    target: Object3D;
    shadow: DirectionalLightShadow;
    copy(source: DirectionalLight): this;
    toJSON(meta?: JSONMeta): DirectionalLightJSON;
}
declare class NodeMaterialObserver {
    constructor(builder: NodeBuilder);
    hasNode: boolean;
    hasAnimation: boolean;
    refreshUniforms: string[];
    renderId: number;
    needsVelocity(renderer: Renderer): boolean;
    containsNode(builder: NodeBuilder): boolean;
}
export interface NodeMaterialNodeProperties {
    fog: boolean;
    lights: boolean;
    lightsNode: LightsNode | null;
    envNode: Node$1 | null;
    aoNode: Node$1 | null;
    colorNode: Node$1<"float"> | Node$1<"vec2"> | Node$1<"vec3"> | Node$1<"vec4"> | Node$1<"color"> | null;
    normalNode: Node$1 | null;
    opacityNode: Node$1 | null;
    backdropNode: Node$1 | null;
    backdropAlphaNode: Node$1 | null;
    alphaTestNode: Node$1 | null;
    maskNode: Node$1 | null;
    maskShadowNode: Node$1 | null;
    positionNode: Node$1 | null;
    geometryNode: Node$1 | null;
    depthNode: Node$1 | null;
    receivedShadowPositionNode: Node$1 | null;
    castShadowPositionNode: Node$1 | null;
    receivedShadowNode: (() => Node$1) | null;
    castShadowNode: Node$1 | null;
    outputNode: Node$1 | null;
    mrtNode: MRTNode | null;
    fragmentNode: Node$1 | null;
    vertexNode: Node$1 | null;
    contextNode: ContextNode<unknown> | null;
}
export interface NodeMaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<NodeMaterialNodeProperties>>, MaterialParameters {
}
declare class NodeMaterial extends Material {
    static get type(): string;
    readonly isNodeMaterial: boolean;
    setValues(values?: NodeMaterialParameters): void;
    build(builder: NodeBuilder): void;
    setupObserver(builder: NodeBuilder): NodeMaterialObserver;
    setup(builder: NodeBuilder): void;
    setupClipping(builder: NodeBuilder): ClippingNode;
    setupHardwareClipping(builder: NodeBuilder): void;
    setupDepth(builder: NodeBuilder): void;
    setupPositionView(builder: NodeBuilder): Node$1;
    setupModelViewProjection(): Node$1;
    setupVertex(builder: NodeBuilder): Node$1;
    setupPosition(builder: NodeBuilder): Node$1;
    setupDiffuseColor(builder: NodeBuilder): void;
    setupVariants(builder: NodeBuilder): void;
    setupOutgoingLight(): Node$1;
    setupNormal(): Node$1;
    setupEnvironment(builder: NodeBuilder): Node$1 | null;
    setupLightMap(builder: NodeBuilder): Node$1;
    setupMaterialLightings(builder: NodeBuilder): LightingNode[];
    setupAmbientOcclusion(builder: NodeBuilder): Node$1;
    setupLightingModel(): LightingModel;
    setupLighting(builder: NodeBuilder): Node$1;
    setupFog(builder: NodeBuilder, outputNode: Node$1): Node$1;
    setupPremultipliedAlpha(builder: NodeBuilder, outputNode: Node$1): Node$1;
    setupOutput(builder: NodeBuilder, outputNode: Node$1): Node$1;
    setDefaultValues(material: Material): void;
    copy(source: Material): this;
}
export interface NodeMaterial extends NodeMaterialNodeProperties {
}
declare class ClippingGroup extends Group {
    readonly isClippingGroup: true;
    clippingPlanes: Plane[];
    enabled: boolean;
    clipIntersection: boolean;
    clipShadows: boolean;
    constructor();
}
declare class ClippingContext {
    constructor(parentContext?: ClippingContext | null);
    readonly id: number;
    readonly version: number;
    clipIntersection: boolean | null;
    cacheKey: string;
    shadowPass: boolean;
    viewMatrix: Matrix4;
    viewNormalMatrix: Matrix3;
    clippingGroupContexts: WeakMap<ClippingGroup, ClippingContext>;
    intersectionPlanes: Vector4[];
    unionPlanes: Vector4[];
    readonly parentVersion: number | null;
    projectPlanes(source: Plane[], destination: Vector4[], offset: number): void;
    updateGlobal(scene: Scene, camera: Camera): void;
    update(parentContext: ClippingContext, clippingGroup: ClippingGroup): void;
    getGroupContext(clippingGroup: ClippingGroup): ClippingContext;
    get unionClippingCount(): number;
}
declare class ShadowBaseNode extends Node$1 {
    light: Light;
    readonly isShadowBasedNode: true;
    constructor(light: Light);
    getShadowMaterial(): NodeMaterial;
    disposeShadowMaterial(): void;
    getShadowRenderObjectFunction(renderer: Renderer, shadow?: LightShadow): (object: Object3D, scene: Scene, _camera: Camera, geometry: BufferGeometry, material: Material, group: Group, lightsNode: LightsNode, clippingContext?: ClippingContext | null, passId?: string | null) => void;
    setupShadowPosition(builder: NodeBuilder): void;
}
declare class ShadowNode extends ShadowBaseNode {
    constructor(light: Light, shadow: LightShadow | null);
}
export type FloatOrNumber = Node$1<"float"> | number;
export type FloatVector = Node$1<"vec2"> | Node$1<"vec3"> | Node$1<"vec4">;
export type FloatVectorOrNumber = FloatOrNumber | Node$1<"vec2"> | Node$1<"vec3"> | Node$1<"vec4">;
export type Vec2 = Node$1<"vec2"> | Vector2;
export type Vec3 = Node$1<"vec3"> | Vector3 | Node$1<"color"> | Color;
export type Vec4 = Node$1<"vec4"> | Vector4;
export type Vec2OrFloat = Vec2 | FloatOrNumber;
export type Vec3OrFloat = Vec3 | FloatOrNumber;
export type Vec4OrFloat = Vec4 | FloatOrNumber;
export type Mat3 = Node$1<"mat3"> | Matrix3;
export type Mat4 = Node$1<"mat4"> | Matrix4;
export interface BoolOrVecExtensions<TNodeType> {
    all: () => Node$1<"bool">;
    any: () => Node$1<"bool">;
}
export interface FloatOrVecExtensions<TNodeType> {
    radians: () => Node$1<TNodeType>;
    degrees: () => Node$1<TNodeType>;
    exp: () => Node$1<TNodeType>;
    exp2: () => Node$1<TNodeType>;
    log: () => Node$1<TNodeType>;
    log2: () => Node$1<TNodeType>;
    sqrt: () => Node$1<TNodeType>;
    inverseSqrt: () => Node$1<TNodeType>;
    floor: () => Node$1<TNodeType>;
    ceil: () => Node$1<TNodeType>;
}
export interface FloatVecExtensions<TVec extends FloatVecType> {
    normalize: () => Node$1<TVec>;
}
export interface FloatOrVecExtensions<TNodeType> {
    fract: () => Node$1<TNodeType>;
    sin: () => Node$1<TNodeType>;
    sinh: () => Node$1<TNodeType>;
    cos: () => Node$1<TNodeType>;
    cosh: () => Node$1<TNodeType>;
    tan: () => Node$1<TNodeType>;
    tanh: () => Node$1<TNodeType>;
    asin: () => Node$1<TNodeType>;
    asinh: () => Node$1<TNodeType>;
    acos: () => Node$1<TNodeType>;
    acosh: () => Node$1<TNodeType>;
    atanh: () => Node$1<TNodeType>;
}
export interface FloatExtensions {
    atan: (x?: FloatOrNumber) => Node$1<"float">;
}
export interface Vec2Extensions {
    atan: (x?: Vec2OrFloat) => Node$1<"vec2">;
}
export interface Vec3Extensions {
    atan: (x?: Vec3OrFloat) => Node$1<"vec3">;
}
export interface Vec4Extensions {
    atan: (x?: Vec4OrFloat) => Node$1<"vec4">;
}
export interface FloatOrVecExtensions<TNodeType> {
    abs: () => Node$1<TNodeType>;
}
export interface IntOrVecExtensions<TNodeType> {
    abs: () => Node$1<TNodeType>;
}
export interface FloatOrVecExtensions<TNodeType> {
    sign: () => Node$1<TNodeType>;
}
export interface IntOrVecExtensions<TNodeType> {
    sign: () => Node$1<TNodeType>;
}
export interface FloatOrVecExtensions<TNodeType> {
    length: () => Node$1<"float">;
}
export interface IntOrVecExtensions<TNodeType> {
    length: () => Node$1<"float">;
}
export interface FloatOrVecExtensions<TNodeType> {
    negate: () => Node$1<TNodeType>;
}
export interface IntOrVecExtensions<TNodeType> {
    negate: () => Node$1<TNodeType>;
}
export interface FloatOrVecExtensions<TNodeType> {
    oneMinus: () => Node$1<TNodeType>;
}
export interface FloatOrVecExtensions<TNodeType> {
    dFdx: () => Node$1<TNodeType>;
    dFdy: () => Node$1<TNodeType>;
}
export interface FloatOrVecExtensions<TNodeType> {
    round: () => Node$1<TNodeType>;
}
export interface IntOrVecExtensions<TNodeType> {
    round: () => Node$1<TNodeType>;
}
export interface FloatOrVecExtensions<TNodeType> {
    reciprocal: () => Node$1<TNodeType>;
    trunc: () => Node$1<TNodeType>;
    fwidth: () => Node$1<TNodeType>;
}
export interface MatExtensions<TMat extends MatType> {
    transpose: () => Node$1<TMat>;
}
export interface MatExtensions<TMat extends MatType> {
    determinant: () => Node$1<"float">;
}
export interface MatExtensions<TMat extends MatType> {
    inverse: () => Node$1<TMat>;
}
export interface MinMaxFloatExtension {
    (y: FloatOrNumber, ...params: FloatOrNumber[]): Node$1<"float">;
    (y: Vec2OrFloat, ...params: Vec2OrFloat[]): Node$1<"vec2">;
    (y: Vec3OrFloat, ...params: Vec3OrFloat[]): Node$1<"vec3">;
    (y: Vec4OrFloat, ...params: Vec4OrFloat[]): Node$1<"vec4">;
}
export interface MinMaxVec2Extension {
    (y: Vec2OrFloat, ...params: Vec2OrFloat[]): Node$1<"vec2">;
    (y: Vec3OrFloat, ...params: Vec3OrFloat[]): Node$1<"vec3">;
    (y: Vec4OrFloat, ...params: Vec4OrFloat[]): Node$1<"vec4">;
}
export interface MinMaxVec3Extension {
    (y: Vec3OrFloat, ...params: Vec3OrFloat[]): Node$1<"vec3">;
    (y: Vec4OrFloat, ...params: Vec4OrFloat[]): Node$1<"vec4">;
}
export interface MinMaxVec4Extension {
    (y: Vec4OrFloat, ...params: Vec4OrFloat[]): Node$1<"vec4">;
}
export interface FloatExtensions {
    min: MinMaxFloatExtension;
    max: MinMaxFloatExtension;
}
export interface Vec2Extensions {
    min: MinMaxVec2Extension;
    max: MinMaxVec2Extension;
}
export interface Vec3Extensions {
    min: MinMaxVec3Extension;
    max: MinMaxVec3Extension;
}
export interface Vec4Extensions {
    min: MinMaxVec4Extension;
    max: MinMaxVec4Extension;
}
export interface ReflectVec2Extension {
    (N: Vec2OrFloat): Node$1<"vec2">;
}
export interface ReflectVec3Extension {
    (N: Vec3OrFloat): Node$1<"vec3">;
}
export interface ReflectVec4Extension {
    (N: Vec4OrFloat): Node$1<"vec4">;
}
export interface Vec2Extensions {
    reflect: ReflectVec2Extension;
}
export interface Vec3Extensions {
    reflect: ReflectVec3Extension;
}
export interface Vec4Extensions {
    reflect: ReflectVec4Extension;
}
export interface FloatOrVecExtensions<TNodeType> {
    distance: (y: FloatVectorOrNumber) => Node$1<"float">;
}
export interface DifferenceFloatExtension {
    (y: FloatOrNumber): Node$1<"float">;
    (y: Vec2OrFloat): Node$1<"vec2">;
    (y: Vec3OrFloat): Node$1<"vec3">;
    (y: Vec4OrFloat): Node$1<"vec4">;
}
export interface DifferenceVec2Extension {
    (y: Vec2OrFloat): Node$1<"vec2">;
}
export interface DifferenceVec3Extension {
    (y: Vec3OrFloat): Node$1<"vec3">;
}
export interface DifferenceVec4Extension {
    (y: Vec4OrFloat): Node$1<"vec4">;
}
export interface FloatExtensions {
    difference: DifferenceFloatExtension;
}
export interface Vec2Extensions {
    difference: DifferenceVec2Extension;
}
export interface Vec3Extensions {
    difference: DifferenceVec3Extension;
}
export interface Vec4Extensions {
    difference: DifferenceVec4Extension;
}
export interface FloatVecExtensions<TVec extends FloatVecType> {
    dot: (y: FloatVector) => Node$1<"float">;
}
export interface Vec3Extensions {
    cross: (y: Vec3) => Node$1<"vec3">;
}
export interface PowFloatExtension {
    (y: FloatOrNumber): Node$1<"float">;
    (y: Vec2OrFloat): Node$1<"vec2">;
    (y: Vec3OrFloat): Node$1<"vec3">;
    (y: Vec4OrFloat): Node$1<"vec4">;
}
export interface PowVec2Extension {
    (y: Vec2OrFloat): Node$1<"vec2">;
}
export interface PowVec3Extension {
    (y: Vec3OrFloat): Node$1<"vec3">;
}
export interface PowVec4Extension {
    (y: Vec4OrFloat): Node$1<"vec4">;
}
export interface FloatExtensions {
    pow: PowFloatExtension;
}
export interface Vec2Extensions {
    pow: PowVec2Extension;
}
export interface Vec3Extensions {
    pow: PowVec3Extension;
}
export interface Vec4Extensions {
    pow: PowVec4Extension;
}
export interface FloatOrVecExtensions<TNodeType> {
    pow2: () => Node$1<TNodeType>;
    pow3: () => Node$1<TNodeType>;
    pow4: () => Node$1<TNodeType>;
}
export interface Vec3Extensions {
    transformDirection: (matrix: Mat3 | Mat4) => Node$1<"vec3">;
}
export interface Mat3Extensions {
    transformDirection: (direction: Vec3) => Node$1<"vec3">;
}
export interface Mat4Extensions {
    transformDirection: (direction: Vec3) => Node$1<"vec3">;
}
export interface Vec3Extensions {
    transformNormalByViewMatrix: (matrix: Mat3 | Mat4) => Node$1<"vec3">;
    transformNormalByInverseViewMatrix: (matrix: Mat3 | Mat4) => Node$1<"vec3">;
}
export interface FloatExtensions {
    cbrt: () => Node$1<"float">;
}
export interface FloatVecExtensions<TVec extends FloatVecType> {
    lengthSq: () => Node$1<"float">;
}
export interface ClampFloatExtension {
    (low?: FloatOrNumber, high?: FloatOrNumber): Node$1<"float">;
    (low?: Vec2OrFloat, high?: Vec2OrFloat): Node$1<"vec2">;
    (low?: Vec3OrFloat, high?: Vec3OrFloat): Node$1<"vec3">;
    (low?: Vec4OrFloat, high?: Vec4OrFloat): Node$1<"vec4">;
}
export interface ClampVec2Extension {
    (low?: Vec2OrFloat, high?: Vec2OrFloat): Node$1<"vec2">;
}
export interface ClampVec3Extension {
    (low?: Vec3OrFloat, high?: Vec3OrFloat): Node$1<"vec3">;
}
export interface ClampVec4Extension {
    (low?: Vec4OrFloat, high?: Vec4OrFloat): Node$1<"vec4">;
}
export interface FloatExtensions {
    clamp: ClampFloatExtension;
}
export interface Vec2Extensions {
    clamp: ClampVec2Extension;
}
export interface Vec3Extensions {
    clamp: ClampVec3Extension;
}
export interface Vec4Extensions {
    clamp: ClampVec4Extension;
}
export interface FloatOrVecExtensions<TNodeType> {
    saturate: () => Node$1<TNodeType>;
}
export interface RefractVec2Extension {
    (N: Vec2OrFloat, ratio: FloatOrNumber): Node$1<"vec2">;
}
export interface RefractVec3Extension {
    (N: Vec3OrFloat, ratio: FloatOrNumber): Node$1<"vec3">;
}
export interface RefractVec4Extension {
    (N: Vec4OrFloat, ratio: FloatOrNumber): Node$1<"vec4">;
}
export interface Vec2Extensions {
    refract: RefractVec2Extension;
}
export interface Vec3Extensions {
    refract: RefractVec3Extension;
}
export interface Vec4Extensions {
    refract: RefractVec4Extension;
}
export interface FaceForwardVec2Extension {
    (I: Vec2OrFloat, Nref: Vec2OrFloat): Node$1<"vec2">;
}
export interface FaceForwardVec3Extension {
    (N: Vec3OrFloat, ratio: Vec3OrFloat): Node$1<"vec3">;
}
export interface FaceForwardVec4Extension {
    (N: Vec4OrFloat, ratio: Vec4OrFloat): Node$1<"vec4">;
}
export interface Vec2Extensions {
    faceForward: FaceForwardVec2Extension;
}
export interface Vec3Extensions {
    faceForward: FaceForwardVec3Extension;
}
export interface Vec4Extensions {
    faceForward: FaceForwardVec4Extension;
}
export interface Vec2Extensions {
    rand: () => Node$1<"float">;
}
export interface MixExtension {
    (e1: FloatOrNumber, e2: FloatOrNumber): Node$1<"float">;
    (e1: Vec2OrFloat, e2: Vec2OrFloat): Node$1<"vec2">;
    (e1: Vec3OrFloat, e2: Vec3OrFloat): Node$1<"vec3">;
    (e1: Vec4OrFloat | Vec3, e2: Vec4OrFloat | Vec3): Node$1<"vec4">;
}
export interface FloatExtensions {
    mix: MixExtension;
}
export interface SmoothstepFloatExtension {
    (low: FloatOrNumber, high: FloatOrNumber): Node$1<"float">;
}
export interface SmoothstepVec2Extension {
    (low: Vec2OrFloat, high: Vec2OrFloat): Node$1<"vec2">;
}
export interface SmoothstepVec3Extension {
    (low: Vec3OrFloat, high: Vec3OrFloat): Node$1<"vec3">;
}
export interface SmoothstepVec4Extension {
    (low: Vec4OrFloat, high: Vec4OrFloat): Node$1<"vec4">;
}
export interface FloatExtensions {
    smoothstep: SmoothstepFloatExtension;
}
export interface Vec2Extensions {
    smoothstep: SmoothstepVec2Extension;
}
export interface Vec3Extensions {
    smoothstep: SmoothstepVec3Extension;
}
export interface Vec4Extensions {
    smoothstep: SmoothstepVec4Extension;
}
export interface FloatExtensions {
    step: (edge: FloatOrNumber) => Node$1<"float">;
}
export interface Vec2Extensions {
    step: (edge: Vec2OrFloat) => Node$1<"vec2">;
}
export interface Vec3Extensions {
    step: (edge: Vec3OrFloat) => Node$1<"vec3">;
}
export interface Vec4Extensions {
    step: (edge: Vec4OrFloat) => Node$1<"vec4">;
}
export interface SelectExtension {
    (ifNode: Node$1<"float"> | number, elseNode?: Node$1<"float"> | number | null): Node$1<"float">;
    <TNodeType>(ifNode: Node$1<TNodeType>, elseNode?: Node$1<TNodeType> | null): Node$1<TNodeType>;
}
export interface NodeElements {
    select: SelectExtension;
}
type FloatOrNumber$1 = Node$1<"float"> | number;
export type AnyNumber = Node$1<"float"> | Node$1<"int"> | Node$1<"uint"> | number;
type Vec2$1 = Node$1<"vec2"> | Vector2;
type Vec3$1 = Node$1<"vec3"> | Vector3 | Node$1<"color"> | Color;
type Vec4$1 = Node$1<"vec4"> | Vector4;
type Vec2OrFloat$1 = Vec2$1 | FloatOrNumber$1;
type Vec3OrFloat$1 = Vec3$1 | FloatOrNumber$1;
type Vec4OrFloat$1 = Vec4$1 | FloatOrNumber$1;
export type Vec2OrLess = Vec2$1;
export type Vec3OrLess = Vec2OrLess | Vec3$1;
export type Vec4OrLess = Vec3OrLess | Vec4$1;
export type Mat2 = Node$1<"mat2"> | Matrix2;
type Mat3$1 = Node$1<"mat3"> | Matrix3;
type Mat4$1 = Node$1<"mat4"> | Matrix4;
export type Bool = Node$1<"bool"> | boolean;
export interface NumberToVec {
    float: "vec";
    int: "ivec";
    uint: "uvec";
}
export type NumberToVec2<TNum extends NumType> = `${NumberToVec[TNum]}2`;
export type NumberToVec3<TNum extends NumType> = `${NumberToVec[TNum]}3`;
export type NumberToVec4<TNum extends NumType> = `${NumberToVec[TNum]}4`;
type Number$1<TNum extends NumType> = Node$1<TNum> | number;
export type Vec2OrLessOrNumber<TNum extends NumType> = Number$1<TNum> | Node$1<NumberToVec2<TNum>>;
export type Vec3OrLessOrNumber<TNum extends NumType> = Vec2OrLessOrNumber<TNum> | Node$1<NumberToVec3<TNum>>;
export type Vec4OrLessOrNumber<TNum extends NumType> = Vec3OrLessOrNumber<TNum> | Node$1<NumberToVec4<TNum>>;
export interface NodeParameterForNumType {
    float: Node$1<"float"> | Node$1<"int"> | Node$1<"uint">;
    int: Node$1<"int">;
    uint: Node$1<"uint">;
}
export type NumberParameterForNumType<TNum extends NumType> = NodeParameterForNumType[TNum] | number;
export interface Vec2NodeParameterForNumType {
    float: Node$1<"vec2"> | Node$1<"ivec2"> | Node$1<"uvec2">;
    int: Node$1<"ivec2">;
    uint: Node$1<"uvec2">;
}
export type Vec2OrLessOrNumberParameterForNumType<TNum extends NumType> = Vec2NodeParameterForNumType[TNum] | NumberParameterForNumType<TNum>;
export interface Vec3NodeParameterForNumType {
    float: Node$1<"vec3"> | Node$1<"ivec3"> | Node$1<"uvec3">;
    int: Node$1<"ivec3">;
    uint: Node$1<"uvec3">;
}
export type Vec3OrLessOrNumberParameterForNumType<TNum extends NumType> = Vec3NodeParameterForNumType[TNum] | Vec2OrLessOrNumberParameterForNumType<TNum>;
export interface Vec4NodeParameterForNumType {
    float: Node$1<"vec4"> | Node$1<"ivec4"> | Node$1<"uvec4">;
    int: Node$1<"ivec4">;
    uint: Node$1<"uvec4">;
}
export type Vec4OrLessOrNumberParameterForNumType<TNum extends NumType> = Vec4NodeParameterForNumType[TNum] | Vec3OrLessOrNumberParameterForNumType<TNum>;
export interface AddSubMulDivNumberVecNumExtensions<TNum extends NumType> {
    (b: NumberParameterForNumType<TNum>, ...params: NumberParameterForNumType<TNum>[]): Node$1<TNum>;
    (b: Vec2OrLessOrNumberParameterForNumType<TNum>, ...params: Vec2OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec2<TNum>>;
    (b: Vec3OrLessOrNumberParameterForNumType<TNum>, ...params: Vec3OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec3<TNum>>;
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec4<TNum>>;
}
export interface AddSubMulDivNumberVecNumberAssignExtensions<TNum extends NumType> {
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): this;
}
export interface AddSubMulDivNumberVecVec2Extensions<TNum extends NumType> {
    (b: Vec2OrLessOrNumberParameterForNumType<TNum>, ...params: Vec2OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec2<TNum>>;
    (b: Vec3OrLessOrNumberParameterForNumType<TNum>, ...params: Vec3OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec3<TNum>>;
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec4<TNum>>;
}
export interface AddSubMulDivNumberVecVec2AssignExtensions<TNum extends NumType> {
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): this;
}
export interface AddSubMulDivNumberVecVec3Extensions<TNum extends NumType> {
    (b: Vec3OrLessOrNumberParameterForNumType<TNum>, ...params: Vec3OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec3<TNum>>;
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec4<TNum>>;
}
export interface AddSubMulDivNumberVecVec3AssignExtensions<TNum extends NumType> {
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): this;
}
export interface AddSubMulDivNumberVecVec4Extensions<TNum extends NumType> {
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): Node$1<NumberToVec4<TNum>>;
}
export interface AddSubMulDivNumberVecVec4AssignExtensions<TNum extends NumType> {
    (b: Vec4OrLessOrNumberParameterForNumType<TNum>, ...params: Vec4OrLessOrNumberParameterForNumType<TNum>[]): this;
}
export interface AddSubMulMat2Extensions {
    (b: Mat2): Node$1<"mat2">;
}
export interface AddSubMulMat2AssignExtensions {
    (b: Mat2): this;
}
export interface AddSubMulMat3Extensions {
    (b: Mat3$1): Node$1<"mat3">;
}
export interface AddSubMulMat3AssignExtensions {
    (b: Mat3$1): this;
}
export interface AddSubMulMat4Extensions {
    (b: Mat4$1): Node$1<"mat4">;
}
export interface AddSubMulMat4AssignExtensions {
    (b: Mat3$1): this;
}
export interface MulMatNumNumExtensions {
    (b: Mat2): Node$1<"mat2">;
    (b: Mat3$1): Node$1<"mat3">;
    (b: Mat4$1): Node$1<"mat4">;
}
export interface MulMatNumMat2Extensions {
    (b: AnyNumber): Node$1<"mat2">;
}
export interface MulMatNumMat3Extensions {
    (b: AnyNumber): Node$1<"mat3">;
}
export interface MulMatNumMat4Extensions {
    (b: AnyNumber): Node$1<"mat4">;
}
export interface MulMatNumMat2AssignExtensions {
    (b: AnyNumber): this;
}
export interface MulMatNumMat3AssignExtensions {
    (b: AnyNumber): this;
}
export interface MulMatNumMat4AssignExtensions {
    (b: AnyNumber): this;
}
export interface MulVecMatMat2Extensions {
    (b: Vec4OrLess): Node$1<"vec2">;
}
export interface MulVecMatMat3Extensions {
    (b: Vec4OrLess): Node$1<"vec3">;
}
export interface MulVecMatMat4Extensions {
    (b: Vec4OrLess): Node$1<"vec4">;
}
export interface MulVecMatVecExtensions {
    (b: Mat2): Node$1<"vec2">;
    (b: Mat3$1): Node$1<"vec3">;
    (b: Mat4$1): Node$1<"vec4">;
}
export interface MulNumExtension<TNum extends NumType> extends AddSubMulDivNumberVecNumExtensions<TNum>, MulMatNumNumExtensions {
}
export interface MulVec2Extensions<TNum extends NumType> extends AddSubMulDivNumberVecVec2Extensions<TNum>, MulVecMatVecExtensions {
}
export interface MulVec3Extensions<TNum extends NumType> extends AddSubMulDivNumberVecVec3Extensions<TNum>, MulVecMatVecExtensions {
}
export interface MulVec4Extensions<TNum extends NumType> extends AddSubMulDivNumberVecVec4Extensions<TNum>, MulVecMatVecExtensions {
}
export interface MulMat2Extensions extends AddSubMulMat2Extensions, MulMatNumMat2Extensions, MulVecMatMat2Extensions {
}
export interface MulMat3Extensions extends AddSubMulMat3Extensions, MulMatNumMat3Extensions, MulVecMatMat3Extensions {
}
export interface MulMat4Extensions extends AddSubMulMat4Extensions, MulMatNumMat4Extensions, MulVecMatMat4Extensions {
}
export interface MulMat2AssignExtensions extends AddSubMulMat2AssignExtensions, MulMatNumMat2AssignExtensions {
}
export interface MulMat3AssignExtensions extends AddSubMulMat3AssignExtensions, MulMatNumMat3AssignExtensions {
}
export interface MulMat4AssignExtensions extends AddSubMulMat4AssignExtensions, MulMatNumMat4AssignExtensions {
}
export interface FloatExtensions {
    mul: (b: Node$1<"color">) => Node$1<"vec3">;
}
export interface NumExtensions<TNum extends NumType> {
    add: AddSubMulDivNumberVecNumExtensions<TNum>;
    sub: AddSubMulDivNumberVecNumExtensions<TNum>;
    mul: MulNumExtension<TNum>;
    div: AddSubMulDivNumberVecNumExtensions<TNum>;
    addAssign: AddSubMulDivNumberVecNumberAssignExtensions<TNum>;
    subAssign: AddSubMulDivNumberVecNumberAssignExtensions<TNum>;
    mulAssign: AddSubMulDivNumberVecNumberAssignExtensions<TNum>;
    divAssign: AddSubMulDivNumberVecNumberAssignExtensions<TNum>;
}
export interface Vec2Extensions {
    add: (b: Node$1<"color">) => Node$1<"vec3">;
    mul: (b: Node$1<"color">) => Node$1<"vec3">;
}
export interface Vec3Extensions {
    add: (b: Node$1<"color">) => Node$1<"vec3">;
    mul: (b: Node$1<"color">) => Node$1<"vec3">;
}
export interface Vec4Extensions {
    add: (b: Node$1<"color">) => Node$1<"vec4">;
    mul: (b: Node$1<"color">) => Node$1<"vec4">;
}
export interface ColorExtensions {
    add: (b: Number$1<"float">) => Node$1<"vec3">;
    sub: (b: Number$1<"float">) => Node$1<"vec3">;
    mul: (b: Number$1<"float">) => Node$1<"vec3">;
    div: (b: Number$1<"float">) => Node$1<"vec3">;
}
export interface NumVec2Extensions<TNum extends NumType> {
    add: AddSubMulDivNumberVecVec2Extensions<TNum>;
    sub: AddSubMulDivNumberVecVec2Extensions<TNum>;
    mul: MulVec2Extensions<TNum>;
    div: AddSubMulDivNumberVecVec2Extensions<TNum>;
    addAssign: AddSubMulDivNumberVecVec2AssignExtensions<TNum>;
    subAssign: AddSubMulDivNumberVecVec2AssignExtensions<TNum>;
    mulAssign: AddSubMulDivNumberVecVec2AssignExtensions<TNum>;
    divAssign: AddSubMulDivNumberVecVec2AssignExtensions<TNum>;
}
export interface NumVec3Extensions<TNum extends NumType> {
    add: AddSubMulDivNumberVecVec3Extensions<TNum>;
    sub: AddSubMulDivNumberVecVec3Extensions<TNum>;
    mul: MulVec3Extensions<TNum>;
    div: AddSubMulDivNumberVecVec3Extensions<TNum>;
    addAssign: AddSubMulDivNumberVecVec3AssignExtensions<TNum>;
    subAssign: AddSubMulDivNumberVecVec3AssignExtensions<TNum>;
    mulAssign: AddSubMulDivNumberVecVec3AssignExtensions<TNum>;
    divAssign: AddSubMulDivNumberVecVec3AssignExtensions<TNum>;
}
export interface NumVec4Extensions<TNum extends NumType> {
    add: AddSubMulDivNumberVecVec4Extensions<TNum>;
    sub: AddSubMulDivNumberVecVec4Extensions<TNum>;
    mul: MulVec4Extensions<TNum>;
    div: AddSubMulDivNumberVecVec4Extensions<TNum>;
    addAssign: AddSubMulDivNumberVecVec4AssignExtensions<TNum>;
    subAssign: AddSubMulDivNumberVecVec4AssignExtensions<TNum>;
    mulAssign: AddSubMulDivNumberVecVec4AssignExtensions<TNum>;
    divAssign: AddSubMulDivNumberVecVec4AssignExtensions<TNum>;
}
export interface Mat2Extensions {
    add: AddSubMulMat2Extensions;
    sub: AddSubMulMat2Extensions;
    mul: MulMat2Extensions;
    addAssign: AddSubMulMat2AssignExtensions;
    subAssign: AddSubMulMat2AssignExtensions;
    mulAssign: MulMat2AssignExtensions;
}
export interface Mat3Extensions {
    add: AddSubMulMat3Extensions;
    sub: AddSubMulMat3Extensions;
    mul: MulMat3Extensions;
    addAssign: AddSubMulMat3AssignExtensions;
    subAssign: AddSubMulMat3AssignExtensions;
    mulAssign: MulMat3AssignExtensions;
}
export interface Mat4Extensions {
    add: AddSubMulMat4Extensions;
    sub: AddSubMulMat4Extensions;
    mul: MulMat4Extensions;
    addAssign: AddSubMulMat4AssignExtensions;
    subAssign: AddSubMulMat4AssignExtensions;
    mulAssign: MulMat4AssignExtensions;
}
export interface NumExtensions<TNum extends NumType> {
    mod: (b: Vec4OrLessOrNumber<TNum>) => Node$1<TNum>;
    modAssign: (b: Vec4OrLessOrNumber<TNum>) => this;
}
export interface NumVec2Extensions<TNum extends NumType> {
    mod: (b: Vec4OrLessOrNumber<TNum>) => Node$1<NumberToVec2<TNum>>;
    modAssign: (b: Vec4OrLessOrNumber<TNum>) => this;
}
export interface NumVec3Extensions<TNum extends NumType> {
    mod: (b: Vec4OrLessOrNumber<TNum>) => Node$1<NumberToVec3<TNum>>;
    modAssign: (b: Vec4OrLessOrNumber<TNum>) => this;
}
export interface NumVec4Extensions<TNum extends NumType> {
    mod: (b: Vec4OrLessOrNumber<TNum>) => Node$1<NumberToVec4<TNum>>;
    modAssign: (b: Vec4OrLessOrNumber<TNum>) => this;
}
export interface ComparisonOperatorNumExtensions<TNum extends NumType> {
    (b: Number$1<TNum>): Node$1<"bool">;
}
export interface ComparisonOperatorVec2Extensions {
    (b: Vec2OrFloat$1): Node$1<"bvec2">;
}
export interface ComparisonOperatorVec3Extensions {
    (b: Vec3OrFloat$1): Node$1<"bvec3">;
}
export interface ComparisonOperatorVec4Extensions {
    (b: Vec4OrFloat$1): Node$1<"bvec4">;
}
export interface FloatExtensions {
    equal: ComparisonOperatorNumExtensions<"float">;
    notEqual: ComparisonOperatorNumExtensions<"float">;
    lessThan: ComparisonOperatorNumExtensions<"float">;
    greaterThan: ComparisonOperatorNumExtensions<"float">;
    lessThanEqual: ComparisonOperatorNumExtensions<"float">;
    greaterThanEqual: ComparisonOperatorNumExtensions<"float">;
}
export interface IntExtensions {
    equal: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    notEqual: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    lessThan: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    greaterThan: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    lessThanEqual: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    greaterThanEqual: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
}
export interface UintExtensions {
    equal: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    notEqual: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    lessThan: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    greaterThan: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    lessThanEqual: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
    greaterThanEqual: (b: Number$1<"int"> | Number$1<"uint">) => Node$1<"bool">;
}
export interface Vec2Extensions {
    equal: ComparisonOperatorVec2Extensions;
    notEqual: ComparisonOperatorVec2Extensions;
    lessThan: ComparisonOperatorVec2Extensions;
    greaterThan: ComparisonOperatorVec2Extensions;
    lessThanEqual: ComparisonOperatorVec2Extensions;
    greaterThanEqual: ComparisonOperatorVec2Extensions;
}
export interface Vec3Extensions {
    equal: ComparisonOperatorVec3Extensions;
    notEqual: ComparisonOperatorVec3Extensions;
    lessThan: ComparisonOperatorVec3Extensions;
    greaterThan: ComparisonOperatorVec3Extensions;
    lessThanEqual: ComparisonOperatorVec3Extensions;
    greaterThanEqual: ComparisonOperatorVec3Extensions;
}
export interface Vec4Extensions {
    equal: ComparisonOperatorVec4Extensions;
    notEqual: ComparisonOperatorVec4Extensions;
    lessThan: ComparisonOperatorVec4Extensions;
    greaterThan: ComparisonOperatorVec4Extensions;
    lessThanEqual: ComparisonOperatorVec4Extensions;
    greaterThanEqual: ComparisonOperatorVec4Extensions;
}
export interface AndOrBoolExtensions {
    (b: Bool, ...params: Bool[]): Node$1<"bool">;
}
export interface BoolExtensions {
    and: AndOrBoolExtensions;
    or: AndOrBoolExtensions;
    xor: (b: Bool) => Node$1<"bool">;
}
export interface BoolOrVecExtensions<TNodeType> {
    not: () => Node$1<TNodeType>;
}
export interface BinaryBitOperatorIntegerExtensions<TInteger extends IntegerType> {
    (b: Number$1<TInteger>): Node$1<TInteger>;
}
export interface BinaryBitOperatorIntegerAssignExtensions<TInteger extends IntegerType> {
    (b: Number$1<TInteger>): this;
}
export interface IntegerExtensions<TInteger extends IntegerType> {
    bitAnd: BinaryBitOperatorIntegerExtensions<TInteger>;
    bitNot: () => Node$1<TInteger>;
    bitOr: BinaryBitOperatorIntegerExtensions<TInteger>;
    bitXor: BinaryBitOperatorIntegerExtensions<TInteger>;
    shiftLeft: BinaryBitOperatorIntegerExtensions<TInteger>;
    shiftRight: BinaryBitOperatorIntegerExtensions<TInteger>;
    bitAndAssign: BinaryBitOperatorIntegerAssignExtensions<TInteger>;
    bitNotAssign: () => this;
    bitOrAssign: BinaryBitOperatorIntegerAssignExtensions<TInteger>;
    bitXorAssign: BinaryBitOperatorIntegerAssignExtensions<TInteger>;
    shiftLeftAssign: BinaryBitOperatorIntegerAssignExtensions<TInteger>;
    shiftRightAssign: BinaryBitOperatorIntegerAssignExtensions<TInteger>;
}
export interface IncrementDecrementIntegerExtensions<TInteger extends IntegerType> {
    (): Node$1<TInteger>;
}
export interface IntegerExtensions<TInteger extends IntegerType> {
    incrementBefore: IncrementDecrementIntegerExtensions<TInteger>;
    decrementBefore: IncrementDecrementIntegerExtensions<TInteger>;
    increment: IncrementDecrementIntegerExtensions<TInteger>;
    decrement: IncrementDecrementIntegerExtensions<TInteger>;
}
declare class DebugNode extends Node$1 {
    constructor(node: Node$1, callback?: ((code: string) => void) | null);
}
export interface NodeElements {
    debug: (callback?: ((node: NodeBuilder, code: string) => void) | null) => DebugNode;
}
declare class MRTNode extends OutputStructNode {
    outputNodes: {
        [name: string]: Node$1;
    };
    blendModes: {
        [name: string]: BlendMode;
    };
    clearColors: {
        [name: string]: Color4;
    };
    readonly isMRTNode: true;
    constructor(outputNodes: {
        [name: string]: Node$1;
    });
    setBlendMode(name: string, blend: BlendMode): this;
    getBlendMode(name: string): BlendMode;
    setClearColor(name: string, color: ColorRepresentation, alpha?: number): this;
    getClearColor(name: string): Color4 | null;
    has(name: string): boolean;
    get: (name: string) => Node$1;
    merge(mrtNode: MRTNode): MRTNode;
}
export interface Object3D {
    count?: number | undefined;
    occlusionTest?: boolean | undefined;
}
export interface BackendParameters {
    canvas?: HTMLCanvasElement | OffscreenCanvas | undefined;
}
declare abstract class Backend {
    renderer: Renderer | null;
    domElement: HTMLCanvasElement | OffscreenCanvas | null;
    constructor(parameters?: BackendParameters);
    init(renderer: Renderer): void;
    abstract get coordinateSystem(): CoordinateSystem;
    getDomElement(): HTMLCanvasElement | OffscreenCanvas;
}
export interface ReadbackBufferEventMap {
    release: {};
    dispose: {};
}
declare class ReadbackBuffer<TEventMap extends ReadbackBufferEventMap = ReadbackBufferEventMap> extends EventDispatcher<TEventMap> {
    constructor(maxByteLength: number);
    name: string;
    buffer: ArrayBuffer | null;
    maxByteLength: number;
    readonly isReadbackBuffer: boolean;
    release(): void;
    dispose(): void;
}
declare class Info {
    autoReset: boolean;
    readonly frame: number;
    readonly calls: number;
    readonly render: {
        calls: number;
        frameCalls: number;
        drawCalls: number;
        triangles: number;
        points: number;
        lines: number;
        timestamp: number;
    };
    readonly compute: {
        calls: number;
        frameCalls: number;
        timestamp: number;
    };
    readonly memory: {
        attributes: number;
        attributesSize: number;
        geometries: number;
        indexAttributes: number;
        indexAttributesSize: number;
        indirectStorageAttributes: number;
        indirectStorageAttributesSize: number;
        programs: number;
        programsSize: number;
        readbackBuffers: number;
        readbackBuffersSize: number;
        renderTargets: number;
        storageAttributes: number;
        storageAttributesSize: number;
        textures: number;
        texturesSize: number;
        uniformBuffers: number;
        uniformBuffersSize: number;
        total: number;
    };
    update(object: Object3D, count: number, instanceCount: number): void;
    reset(): void;
    dispose(): void;
    createTexture(texture: Texture): void;
    destroyTexture(texture: Texture): void;
    createAttribute(attribute: BufferAttribute): void;
    createIndexAttribute(attribute: BufferAttribute): void;
    createStorageAttribute(attribute: BufferAttribute): void;
    createIndirectStorageAttribute(attribute: BufferAttribute): void;
    destroyAttribute(attribute: BufferAttribute): void;
    createReadbackBuffer(readbackBuffer: ReadbackBuffer): void;
    destroyReadbackBuffer(readbackBuffer: ReadbackBuffer): void;
}
export interface InspectorBaseEventMap {
    dispose: {};
}
declare class InspectorBase<TEventMap extends InspectorBaseEventMap = InspectorBaseEventMap> extends EventDispatcher<TEventMap> {
    currentFrame: unknown;
    isRunning: boolean;
    enabled: boolean;
    get nodeFrame(): NodeFrame;
    setRenderer(renderer: Renderer): InspectorBase;
    getRenderer(): Renderer;
    begin(): void;
    finish(): void;
    inspect(node: Node$1): void;
    computeAsync(computeNode: ComputeNode, dispatchSizeOrCount: number | number[]): void;
    beginCompute(uid: string, computeNode: ComputeNode): void;
    finishCompute(uid: string): void;
    beginRender(uid: string, scene: Scene, camera: Camera, renderTarget: RenderTarget): void;
    finishRender(uid: string): void;
    copyTextureToTexture(srcTexture: Texture, dstTexture: Texture): void;
    copyFramebufferToTexture(framebufferTexture: Texture): void;
    dispose(): void;
}
declare class NodeLibrary {
    materialNodes: Map<string, {
        new (): NodeMaterial;
    }>;
    toneMappingNodes: Map<ToneMapping, (color: Node$1, exposure: Node$1) => Node$1>;
    fromMaterial(material: Material): NodeMaterial;
    addToneMapping(toneMappingNode: (color: Node$1, exposure: Node$1) => Node$1, toneMapping: ToneMapping): void;
    getToneMappingFunction(toneMapping: ToneMapping): ((color: Node$1, exposure: Node$1) => Node$1) | null;
    getMaterialNodeClass(materialType: string): (new () => NodeMaterial) | null;
    addMaterial(materialNodeClass: {
        new (): NodeMaterial;
    }, materialClassType: string): void;
    getLightNodeClass(lightClass: {
        new (): Light;
    }): ({
        new (light: Light): AnalyticLightNode<Light>;
    }) | null;
    addLight<TLight extends Light>(lightNodeClass: {
        new (light: TLight): AnalyticLightNode<TLight>;
    }, lightClass: {
        new (): TLight;
    }): void;
    addType<TNodeClass, TType>(nodeClass: TNodeClass, type: TType, library: Map<TType, TNodeClass>): void;
}
declare class StandardDrawingPipeline {
    renderer: Renderer | null;
    protected _frustum: Frustum;
    protected _frustumArray: FrustumArray | null;
    protected _projScreenMatrix: Matrix4;
    protected _bundleDepth: number;
    prepareAsync(scene: Object3D, camera: Camera): Promise<void> | undefined;
    dispose(): void;
    begin(camera: Camera, renderContext: unknown): void;
    beginRenderList(renderList: unknown): void;
    finishRenderList(renderList: unknown): void;
    isCulled(object: Object3D, camera: Camera): boolean;
    pushRenderItem(renderList: unknown, object: Object3D, geometry: BufferGeometry, material: Material, groupOrder: number, z: number, group: GeometryGroup | null, clippingContext: ClippingContext): void;
    project(object: Object3D, camera: Camera, groupOrder: number, renderList: unknown, clippingContext: ClippingContext): void;
}
export class CylinderGeometry extends BufferGeometry {
    constructor(radiusTop?: number, radiusBottom?: number, height?: number, radialSegments?: number, heightSegments?: number, openEnded?: boolean, thetaStart?: number, thetaLength?: number);
    override readonly type: string | "CylinderGeometry";
    readonly parameters: {
        readonly radiusTop: number;
        readonly radiusBottom: number;
        readonly height: number;
        readonly radialSegments: number;
        readonly heightSegments: number;
        readonly openEnded: boolean;
        readonly thetaStart: number;
        readonly thetaLength: number;
    };
    static fromJSON(data: any): CylinderGeometry;
}
export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
    override readonly type: string | "PlaneGeometry";
    readonly parameters: {
        readonly width: number;
        readonly height: number;
        readonly widthSegments: number;
        readonly heightSegments: number;
    };
    static fromJSON(data: {}): PlaneGeometry;
}
export interface MeshJSONObject extends Object3DJSONObject {
    geometry: string;
}
export interface MeshJSON extends Object3DJSON {
    object: MeshJSONObject;
}
export class Mesh<TGeometry extends BufferGeometry = BufferGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Object3D<TEventMap> {
    constructor(geometry?: TGeometry, material?: TMaterial);
    readonly isMesh: true;
    override readonly type: string | "Mesh";
    geometry: TGeometry;
    material: TMaterial;
    morphTargetInfluences?: number[] | undefined;
    morphTargetDictionary?: {
        [key: string]: number;
    } | undefined;
    count: number;
    updateMorphTargets(): void;
    getVertexPosition(index: number, target: Vector3): Vector3;
    intersectsFrustum(frustum: Frustum | FrustumArray): boolean;
    toJSON(meta?: JSONMeta): MeshJSON;
}
export type XRControllerEventType = XRSessionEventType | XRInputSourceEventType | "disconnected" | "connected";
declare class XRJointSpace$1 extends Group {
    readonly jointRadius: number | undefined;
}
export type XRHandJoints = Record<XRHandJoint, XRJointSpace$1>;
export interface XRHandInputState {
    pinching: boolean;
}
export interface WebXRSpaceEventMap extends Object3DEventMap {
    select: {
        data: XRInputSource;
    };
    selectstart: {
        data: XRInputSource;
    };
    selectend: {
        data: XRInputSource;
    };
    squeeze: {
        data: XRInputSource;
    };
    squeezestart: {
        data: XRInputSource;
    };
    squeezeend: {
        data: XRInputSource;
    };
    connected: {
        data: XRInputSource;
    };
    disconnected: {
        data: XRInputSource;
    };
    pinchend: {
        handedness: XRHandedness;
        target: WebXRController;
    };
    pinchstart: {
        handedness: XRHandedness;
        target: WebXRController;
    };
    move: {};
}
declare class XRHandSpace extends Group<WebXRSpaceEventMap> {
    readonly joints: Partial<XRHandJoints>;
    readonly inputState: XRHandInputState;
}
declare class XRTargetRaySpace extends Group<WebXRSpaceEventMap> {
    hasLinearVelocity: boolean;
    readonly linearVelocity: Vector3;
    hasAngularVelocity: boolean;
    readonly angularVelocity: Vector3;
}
export interface WebXRGripSpaceEventMap extends WebXRSpaceEventMap {
    gripUpdated: {
        data: XRInputSource;
        target: WebXRController;
    };
}
declare class XRGripSpace extends Group<WebXRGripSpaceEventMap> {
    hasLinearVelocity: boolean;
    readonly linearVelocity: Vector3;
    hasAngularVelocity: boolean;
    readonly angularVelocity: Vector3;
}
declare class WebXRController {
    constructor();
    getHandSpace(): XRHandSpace;
    getTargetRaySpace(): XRTargetRaySpace;
    getGripSpace(): XRGripSpace;
    dispatchEvent(event: {
        type: XRControllerEventType;
        data?: XRInputSource;
    }): this;
    connect(inputSource: XRInputSource): this;
    disconnect(inputSource: XRInputSource): this;
    update(inputSource: XRInputSource, frame: XRFrame, referenceSpace: XRReferenceSpace): this;
}
export interface XRManagerEventMap {
    sessionstart: {};
    sessionend: {};
    planesdetected: {
        data: XRFrame;
    };
}
export interface LayerAttributes {
    stencil?: boolean | undefined;
    samples?: number | undefined;
}
export interface XRGPUBinding {
}
declare class XRManager<TEventMap extends XRManagerEventMap = XRManagerEventMap> extends EventDispatcher<TEventMap> {
    constructor(renderer: Renderer, multiview?: boolean);
    enabled: boolean;
    readonly isPresenting: boolean;
    cameraAutoUpdate: boolean;
    getController(index: number): XRTargetRaySpace;
    getControllerGrip(index: number): XRGripSpace;
    getHand(index: number): XRHandSpace;
    getFoveation(): number | undefined;
    setFoveation(foveation: number): void;
    getFramebufferScaleFactor(): number;
    setFramebufferScaleFactor(factor: number): void;
    getReferenceSpaceType(): XRReferenceSpaceType;
    setReferenceSpaceType(type: XRReferenceSpaceType): void;
    getReferenceSpace(): XRReferenceSpace;
    setReferenceSpace(space: XRReferenceSpace): void;
    getCamera(): ArrayCamera;
    getEnvironmentBlendMode(): XREnvironmentBlendMode | undefined;
    getBaseLayer(): (XRWebGLLayer | XRProjectionLayer) | null;
    getBinding(): XRWebGLBinding | null;
    foveateBoundTexture(renderTarget: RenderTarget | null): void;
    getWebGPUBinding(): XRGPUBinding | null;
    getFrame(): XRFrame | null;
    useMultiview(): boolean;
    createQuadLayer(width: number, height: number, translation: Vector3, quaternion: Quaternion, pixelwidth: number, pixelheight: number, rendercall: () => void, attributes?: LayerAttributes): Mesh<PlaneGeometry, MeshBasicMaterial>;
    createCylinderLayer(radius: number, centralAngle: number, aspectratio: number, translation: Vector3, quaternion: Quaternion, pixelwidth: number, pixelheight: number, rendercall: () => void, attributes?: LayerAttributes): Mesh<CylinderGeometry, MeshBasicMaterial>;
    renderLayers(): void;
    getSession(): XRSession | null;
    setSession(session: XRSession): Promise<void>;
    updateCamera(camera: PerspectiveCamera): void;
}
export interface Scene {
    environmentNode?: Node$1<"vec3"> | null | undefined;
    backgroundNode?: Node$1 | null | undefined;
    fogNode?: Node$1 | null | undefined;
}
export interface DeviceLostInfo {
    api: "WebGL" | "WebGPU";
    message: string;
    reason: string | null;
    originalEvent: unknown;
}
export interface RendererParameters {
    logarithmicDepthBuffer?: boolean | undefined;
    reversedDepthBuffer?: boolean | undefined;
    alpha?: boolean | undefined;
    depth?: boolean | undefined;
    stencil?: boolean | undefined;
    antialias?: boolean | undefined;
    samples?: number | undefined;
    getFallback?: ((error: unknown) => Backend) | null | undefined;
    outputBufferType?: TextureDataType | undefined;
    multiview?: boolean | undefined;
}
export interface RenderItem {
    id: number | null;
    object: Object3D | null;
    geometry: BufferGeometry | null;
    material: Material | null;
    groupOrder: number | null;
    renderOrder: number | null;
    z: number | null;
    group: GeometryGroup | null;
    clippingContext: ClippingContext | null;
}
declare class Renderer {
    constructor(backend: Backend, parameters?: RendererParameters);
    readonly isRenderer: boolean;
    backend: Backend;
    autoClear: boolean;
    autoClearColor: boolean;
    autoClearDepth: boolean;
    autoClearStencil: boolean;
    alpha: boolean;
    readonly logarithmicDepthBuffer: boolean;
    readonly reversedDepthBuffer: boolean;
    outputColorSpace: string;
    toneMapping: ToneMapping;
    toneMappingExposure: number;
    sortObjects: boolean;
    depth: boolean;
    stencil: boolean;
    info: Info;
    contextNode: ContextNode<unknown>;
    library: NodeLibrary;
    lighting: Lighting;
    set drawingPipeline(pipeline: StandardDrawingPipeline);
    get drawingPipeline(): StandardDrawingPipeline;
    onDeviceLost: (info: DeviceLostInfo) => void;
    onError: (errorMessage: string) => void;
    transparent: boolean;
    opaque: boolean;
    shadowMap: {
        enabled: boolean;
        transmitted: boolean;
        type: ShadowMapType;
    };
    xr: XRManager;
    debug: {
        checkShaderErrors: boolean;
        diagnostics: {
            keywords: boolean;
        };
        onNodeBuilderCreated: ((nodeBuilder: NodeBuilder, object: unknown) => void) | null;
        onShaderError: ((gl: WebGL2RenderingContext, programGPU: WebGLProgram, glVertexShader: WebGLShader, glFragmentShader: WebGLShader) => void) | null;
        getShaderAsync: (scene: Scene, camera: Camera, object: Object3D) => Promise<{
            fragmentShader: string | null;
            vertexShader: string | null;
        }>;
    };
    init(): Promise<this>;
    get domElement(): HTMLCanvasElement;
    get coordinateSystem(): CoordinateSystem;
    compileAsync(scene: Object3D, camera: Camera, targetScene?: Scene | null, onProgress?: ((event: ProgressEvent) => void) | null): Promise<void>;
    compileComputeAsync(computeNodes: ComputeNode | ComputeNode[], onProgress?: ((event: ProgressEvent) => void) | null): Promise<void>;
    renderAsync(scene: Object3D, camera: Camera): Promise<void>;
    waitForGPU(): Promise<void>;
    set inspector(value: InspectorBase);
    get inspector(): InspectorBase;
    set highPrecision(value: boolean);
    get highPrecision(): boolean;
    setMRT(mrt: MRTNode | null): Renderer;
    getMRT(): MRTNode;
    getOutputBufferType(): TextureDataType;
    getColorBufferType(): TextureDataType;
    render(scene: Object3D, camera: Camera): void;
    get initialized(): boolean;
    getMaxAnisotropy(): number;
    getActiveCubeFace(): number;
    getActiveMipmapLevel(): number;
    setAnimationLoop(callback: ((time: DOMHighResTimeStamp, frame?: XRFrame) => void) | null): Promise<void>;
    getAnimationLoop(): ((time: DOMHighResTimeStamp, xrFrame?: XRFrame) => void) | null;
    getArrayBufferAsync(attribute: BufferAttribute, target?: null, offset?: number, count?: number): Promise<ArrayBuffer>;
    getArrayBufferAsync<TTarget extends ReadbackBuffer | ArrayBuffer>(attribute: BufferAttribute, target: TTarget, offset?: number, count?: number): Promise<TTarget>;
    getContext(): unknown;
    getPixelRatio(): number;
    getDrawingBufferSize(target: Vector2): Vector2;
    getSize(target: Vector2): Vector2;
    setPixelRatio(value?: number): void;
    setDrawingBufferSize(width: number, height: number, pixelRatio: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setOpaqueSort(method: ((a: RenderItem, b: RenderItem) => number) | null): void;
    setTransparentSort(method: ((a: RenderItem, b: RenderItem) => number) | null): void;
    getScissor(target: Vector4): Vector4;
    setScissor(x: Vector4): void;
    setScissor(x: number, y: number, width: number, height: number): void;
    getScissorTest(): boolean;
    setScissorTest(boolean: boolean): void;
    resetState(): void;
    getViewport(target: Vector4): Vector4;
    setViewport(x: Vector4): void;
    setViewport(x: number, y: number, width: number, height: number, minDepth?: number, maxDepth?: number): void;
    getClearColor(target: Color): Color;
    setClearColor(color: ColorRepresentation, alpha?: number): void;
    getClearAlpha(): number;
    setClearAlpha(alpha: number): void;
    getClearDepth(): number;
    setClearDepth(depth: number): void;
    getClearStencil(): number;
    setClearStencil(stencil: number): void;
    isOccluded(object: Object3D): boolean;
    clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
    clearColor(): void;
    clearDepth(): void;
    clearStencil(): void;
    clearAsync(color?: boolean, depth?: boolean, stencil?: boolean): Promise<void>;
    clearColorAsync(): Promise<void>;
    clearDepthAsync(): Promise<void>;
    clearStencilAsync(): Promise<void>;
    get needsFrameBufferTarget(): boolean;
    get samples(): number;
    get currentSamples(): number;
    get currentToneMapping(): ToneMapping;
    get currentColorSpace(): string;
    get isOutputTarget(): boolean;
    dispose(): Promise<void>;
    setRenderTarget(renderTarget: RenderTarget | null, activeCubeFace?: number, activeMipmapLevel?: number): void;
    getRenderTarget(): RenderTarget<Texture<unknown>> | null;
    setOutputRenderTarget(renderTarget: RenderTarget | null): void;
    getOutputRenderTarget(): RenderTarget<Texture<unknown>> | null;
    setCanvasTarget(canvasTarget: CanvasTarget): void;
    getCanvasTarget(): CanvasTarget;
    setRenderObjectFunction(renderObjectFunction: ((object: Object3D, scene: Scene, camera: Camera, geometry: BufferGeometry, material: Material, group: GeometryGroup | null, lightsNode: LightsNode, clippingContext: ClippingContext, passId?: string | null | undefined) => void) | null): void;
    getRenderObjectFunction(): ((object: Object3D, scene: Scene, camera: Camera, geometry: BufferGeometry, material: Material, group: GeometryGroup | null, lightsNode: LightsNode, clippingContext: ClippingContext, passId?: string | null | undefined) => void) | null;
    compute(computeNodes: ComputeNode | ComputeNode[], dispatchSize?: number | number[] | IndirectStorageBufferAttribute): Promise<void> | undefined;
    computeAsync(computeNodes: ComputeNode | ComputeNode[], dispatchSize?: number | number[] | IndirectStorageBufferAttribute): Promise<void>;
    hasFeatureAsync(name: string): Promise<boolean>;
    resolveTimestampsAsync(type?: TimestampQuery): Promise<number | undefined>;
    hasFeature(name: string): boolean;
    hasInitialized(): boolean;
    initTextureAsync(texture: Texture): Promise<void>;
    initTexture(texture: Texture): void;
    initRenderTarget(renderTarget: RenderTarget): void;
    copyFramebufferToTexture(framebufferTexture: FramebufferTexture, rectangle?: (Vector2 | Vector4) | null): void;
    copyTextureToTexture(srcTexture: Texture, dstTexture: Texture, srcRegion?: Box2 | Box3 | null, dstPosition?: Vector2 | Vector3 | null, srcLevel?: number, dstLevel?: number): void;
    readRenderTargetPixelsAsync(renderTarget: RenderTarget, x: number, y: number, width: number, height: number, textureIndex?: number, faceIndex?: number): Promise<TypedArray>;
    renderObject(object: Object3D, scene: Scene, camera: Camera, geometry: BufferGeometry, material: Material, group: GeometryGroup | null, lightsNode: LightsNode, clippingContext?: ClippingContext | null, passId?: string | null): void;
    hasCompatibility(name: string): boolean;
    get compile(): (scene: Object3D, camera: Camera, targetScene?: Scene | null, onProgress?: ((event: ProgressEvent) => void) | null) => Promise<void>;
}
declare class RenderPipeline {
    readonly isRenderPipeline: true;
    renderer: Renderer;
    outputNode: Node$1;
    outputColorTransform: boolean;
    needsUpdate: boolean;
    constructor(renderer: Renderer, outputNode?: Node$1);
    render(): void;
    dispose(): void;
    renderAsync(): Promise<void>;
}
declare abstract class NodeBuilder {
    object: Object3D;
    material: Material;
    geometry: BufferGeometry;
    camera: Camera | null;
    compute: ComputeNode | null;
    renderer: Renderer;
    context: unknown;
    readonly renderPipeline: RenderPipeline;
}
export interface NodeJSONMeta {
    textures: {
        [key: string]: unknown;
    };
    images: {
        [key: string]: unknown;
    };
    nodes: {
        [key: string]: NodeJSONIntermediateOutputData;
    };
}
export interface NodeJSONMetadata {
    version: number;
    type: "Node";
    generator: "Node.toJSON";
}
export interface NodeJSONInputNodes {
    [property: string]: string[] | {
        [index: string]: string | undefined;
    } | string | undefined;
}
export interface NodeJSONInputData {
    inputNodes?: NodeJSONInputNodes | undefined;
    meta: {
        textures: {
            [key: string]: unknown;
        };
        nodes: {
            [key: string]: Node$1;
        };
    };
}
export interface NodeJSONIntermediateOutputData {
    uuid: string;
    type: string | undefined;
    meta?: NodeJSONMeta | undefined;
    metadata?: NodeJSONMetadata;
    inputNodes?: NodeJSONInputNodes | undefined;
    textures?: unknown[];
    images?: unknown[];
    nodes?: NodeJSONIntermediateOutputData[];
}
export interface NodeJSONOutputData {
    uuid: string;
    type: string | undefined;
    metadata?: NodeJSONMetadata;
    inputNodes?: NodeJSONInputNodes | undefined;
    textures?: unknown[];
    images?: unknown[];
    nodes?: NodeJSONOutputData[];
}
export interface NodeChild {
    property: string;
    index?: number | string;
    childNode: Node$1;
}
export interface NodeClassEventMap {
    dispose: {};
}
declare class NodeClass<TEventMap extends NodeClassEventMap = NodeClassEventMap> extends EventDispatcher<TEventMap> {
    static get type(): string;
    constructor(nodeType?: string | null);
    nodeType: string | null;
    updateType: NodeUpdateType;
    updateBeforeType: NodeUpdateType;
    updateAfterType: NodeUpdateType;
    readonly version: number;
    name: string;
    global: boolean;
    parents: boolean;
    assignable: boolean;
    readonly isNode: boolean;
    readonly id: number;
    stackTrace: string | null;
    isCacheable(builder: NodeBuilder): boolean;
    toAssignable(): this;
    isAssignable(builder: NodeBuilder): boolean;
    isAssign(builder: NodeBuilder): boolean;
    set needsUpdate(value: boolean);
    get uuid(): string;
    get type(): string;
    onUpdate(callback: (this: this, frame: NodeFrame) => unknown, updateType: NodeUpdateType): this;
    update(frame: NodeFrame): boolean | undefined;
    onFrameUpdate(callback: (this: this, frame: NodeFrame) => unknown): this;
    onRenderUpdate(callback: (this: this, frame: NodeFrame) => unknown): this;
    onObjectUpdate(callback: (this: this, frame: NodeFrame) => unknown): this;
    onReference(callback: (this: this, frame: NodeBuilder | NodeFrame) => unknown): this;
    updateReference(state: NodeBuilder | NodeFrame): unknown;
    isGlobal(builder: NodeBuilder): boolean;
    getChildren(): Array<Node$1>;
    dispose(): void;
    traverse(callback: (node: Node$1) => void): void;
    getCacheKey(force?: boolean, ignores?: Set<Node$1>): number;
    customCacheKey(): number;
    getScope(): this;
    getHash(builder: NodeBuilder): string;
    getUpdateType(frame?: NodeFrame): NodeUpdateType;
    getUpdateBeforeType(frame?: NodeFrame): NodeUpdateType;
    getUpdateAfterType(frame?: NodeFrame): NodeUpdateType;
    getElementType(builder: NodeBuilder): string;
    getMemberType(builder: NodeBuilder, name: string): string;
    getNodeType(builder: NodeBuilder, output?: string): string;
    generateNodeType(builder: NodeBuilder, output?: string): string;
    getShared(builder: NodeBuilder): Node$1;
    getArrayCount(builder: NodeBuilder): number | null;
    setup(builder: NodeBuilder): Node$1 | null | undefined;
    analyze(builder: NodeBuilder, output?: Node$1 | null): void;
    generate(builder: NodeBuilder, output?: string | null): string | null | undefined;
    updateBefore(frame: NodeFrame): boolean | undefined;
    updateAfter(frame: NodeFrame): boolean | undefined;
    build(builder: NodeBuilder, output?: (string | Node$1) | null): (Node$1 | string) | null;
    getSerializeChildren(): NodeChild[];
    serialize(json: NodeJSONIntermediateOutputData): void;
    deserialize(json: NodeJSONInputData): void;
    toJSON(meta?: NodeJSONMeta | string): NodeJSONOutputData;
}
declare const Node$1: {
    new <TNodeType>(nodeType?: TNodeType | null): Node$1<TNodeType>;
    new (nodeType?: string | null): Node$1;
    captureStackTrace: boolean;
};
export interface NodeElements {
}
export interface NodeExtensions<TNodeType> {
}
export type NumType = "float" | "int" | "uint";
export type IntegerType = "int" | "uint";
export type NumOrBoolType = NumType | "bool";
export type FloatVecType = "vec2" | "vec3" | "vec4";
export type MatType = "mat2" | "mat3" | "mat4";
export interface FloatExtensions {
}
export interface IntExtensions {
}
export interface UintExtensions {
}
export interface BoolExtensions {
}
export interface NumExtensions<TNum extends NumType> {
}
export interface IntegerExtensions<TInteger extends IntegerType> {
}
export interface NumOrBoolExtensions<TNumOrBool extends NumOrBoolType> {
}
export interface NumVec2Extensions<TNum extends NumType> {
}
export interface NumVec3Extensions<TNum extends NumType> {
}
export interface NumVec4Extensions<TNum extends NumType> {
}
export interface NumOrBoolVec2Extensions<TNumOrBool extends NumOrBoolType> {
}
export interface NumOrBoolVec3Extensions<TNumOrBool extends NumOrBoolType> {
}
export interface NumOrBoolVec4Extensions<TNumOrBool extends NumOrBoolType> {
}
export interface Vec2Extensions {
}
export interface Vec3Extensions {
}
export interface Vec4Extensions {
}
export interface ColorExtensions {
}
export interface FloatVecExtensions<TVec extends FloatVecType> {
}
export interface FloatOrVecExtensions<TNodeType> {
}
export interface IntOrVecExtensions<TNodeType> {
}
export interface BoolOrVecExtensions<TNodeType> {
}
export interface Mat2Extensions {
}
export interface Mat3Extensions {
}
export interface Mat4Extensions {
}
export interface MatExtensions<TMat extends MatType> {
}
export interface NodeExtras {
    [x: string]: {};
    "float": NumOrBoolExtensions<"float"> & FloatExtensions & NumExtensions<"float"> & FloatOrVecExtensions<"float">;
    "int": NumOrBoolExtensions<"int"> & IntExtensions & NumExtensions<"int"> & IntegerExtensions<"int"> & IntOrVecExtensions<"int">;
    "uint": NumOrBoolExtensions<"uint"> & UintExtensions & NumExtensions<"uint"> & IntegerExtensions<"uint"> & IntOrVecExtensions<"uint">;
    "bool": NumOrBoolExtensions<"bool"> & BoolExtensions & BoolOrVecExtensions<"bool">;
    "vec2": NumOrBoolVec2Extensions<"float"> & Vec2Extensions & NumVec2Extensions<"float"> & FloatVecExtensions<"vec2"> & FloatOrVecExtensions<"vec2">;
    "ivec2": NumOrBoolVec2Extensions<"int"> & NumVec2Extensions<"int"> & IntOrVecExtensions<"ivec2">;
    "uvec2": NumOrBoolVec2Extensions<"uint"> & NumVec2Extensions<"uint"> & IntOrVecExtensions<"uvec2">;
    "bvec2": NumOrBoolVec2Extensions<"bool"> & BoolOrVecExtensions<"bvec2">;
    "vec3": NumOrBoolVec3Extensions<"float"> & Vec3Extensions & NumVec3Extensions<"float"> & FloatVecExtensions<"vec3"> & FloatOrVecExtensions<"vec3">;
    "ivec3": NumOrBoolVec3Extensions<"int"> & NumVec3Extensions<"int"> & IntOrVecExtensions<"ivec3">;
    "uvec3": NumOrBoolVec3Extensions<"uint"> & NumVec3Extensions<"uint"> & IntOrVecExtensions<"uvec3">;
    "bvec3": NumOrBoolVec3Extensions<"bool"> & BoolOrVecExtensions<"bvec3">;
    "vec4": NumOrBoolVec4Extensions<"float"> & Vec4Extensions & NumVec4Extensions<"float"> & FloatVecExtensions<"vec4"> & FloatOrVecExtensions<"vec4">;
    "ivec4": NumOrBoolVec4Extensions<"int"> & NumVec4Extensions<"int"> & IntOrVecExtensions<"ivec4">;
    "uvec4": NumOrBoolVec4Extensions<"uint"> & NumVec4Extensions<"uint"> & IntOrVecExtensions<"uvec4">;
    "bvec4": NumOrBoolVec4Extensions<"bool"> & BoolOrVecExtensions<"bvec4">;
    "color": ColorExtensions;
    "mat2": Mat2Extensions & MatExtensions<"mat2">;
    "mat3": Mat3Extensions & MatExtensions<"mat3">;
    "mat4": Mat4Extensions & MatExtensions<"mat4">;
}
type Node$1<TNodeType = unknown> = NodeClass & NodeElements & (unknown extends TNodeType ? {} : NodeExtensions<TNodeType>) & NodeExtras[TNodeType & string] & {
    __TypeScript_NODE_TYPE__: TNodeType;
};
export interface LightShadow {
    shadowNode?: Node$1;
}
declare class AnalyticLightNode<T extends Light> extends LightingNode {
    light: T | null;
    constructor(light?: T | null);
    disposeShadow(): void;
    getLightVector(builder: NodeBuilder): Node$1;
    setupDirect(builder: NodeBuilder): DirectLightData | undefined;
    setupDirectRectArea(builder: NodeBuilder): DirectRectAreaLightData | undefined;
    setupShadowNode(): ShadowNode;
    setupShadow(builder: NodeBuilder): void;
}
export interface LightJSON extends Object3DJSON {
    color: number;
    intensity: number;
}
declare abstract class Light extends Object3D {
    static registerNode<TLight extends Light>(this: {
        new (...args: any[]): TLight;
    }, lightNodeClass: {
        new (light: TLight): AnalyticLightNode<TLight>;
    }): void;
    constructor(color?: ColorRepresentation, intensity?: number);
    readonly isLight: boolean;
    color: Color;
    intensity: number;
    copy(source: Light, recursive?: boolean): this;
    toJSON(meta?: JSONMeta): LightJSON;
}
export interface WebGLCapabilitiesParameters {
    precision?: string | undefined;
    logarithmicDepthBuffer?: boolean | undefined;
    reversedDepthBuffer?: boolean | undefined;
}
declare class WebGLCapabilities {
    constructor(gl: WebGLRenderingContext, extensions: any, parameters: WebGLCapabilitiesParameters);
    readonly isWebGL2: boolean;
    getMaxAnisotropy: () => number;
    getMaxPrecision: (precision: string) => string;
    textureFormatReadable: (textureFormat: PixelFormat) => boolean;
    textureTypeReadable: (textureType: TextureDataType) => boolean;
    precision: string;
    logarithmicDepthBuffer: boolean;
    reversedDepthBuffer: boolean;
    maxTextures: number;
    maxVertexTextures: number;
    maxTextureSize: number;
    maxCubemapSize: number;
    maxAttributes: number;
    maxVertexUniforms: number;
    maxVaryings: number;
    maxFragmentUniforms: number;
    maxSamples: number;
    samples: number;
}
declare class WebGLExtensions {
    constructor(gl: WebGLRenderingContext);
    has(name: string): boolean;
    init(): void;
    get(name: string): unknown;
}
declare class WebGLUniforms {
    constructor(gl: WebGLRenderingContext, program: WebGLProgram$1);
}
declare class WebGLProgram$1 {
    constructor(renderer: WebGLRenderer, cacheKey: string, parameters: object);
    name: string;
    id: number;
    cacheKey: string;
    usedTimes: number;
    program: unknown;
    vertexShader: WebGLShader;
    fragmentShader: WebGLShader;
    getUniforms(): WebGLUniforms;
    getAttributes(): unknown;
    destroy(): void;
}
declare class WebGLInfo {
    constructor(gl: WebGLRenderingContext);
    autoReset: boolean;
    memory: {
        geometries: number;
        textures: number;
    };
    programs: WebGLProgram$1[] | null;
    render: {
        calls: number;
        frame: number;
        lines: number;
        points: number;
        triangles: number;
    };
    update(count: number, mode: number, instanceCount: number): void;
    reset(): void;
}
declare class WebGLProperties {
    constructor();
    has: (object: unknown) => boolean;
    get: (object: unknown) => unknown;
    remove: (object: unknown) => void;
    update: (object: unknown, key: unknown, value: unknown) => unknown;
    dispose: () => void;
}
interface RenderItem$1 {
    id: number;
    object: Object3D;
    geometry: BufferGeometry | null;
    material: Material;
    materialVariant: number;
    groupOrder: number;
    renderOrder: number;
    z: number;
    group: Group | null;
}
declare class WebGLRenderList {
    constructor(properties: WebGLProperties);
    opaque: RenderItem$1[];
    transparent: RenderItem$1[];
    transmissive: RenderItem$1[];
    init(): void;
    push(object: Object3D, geometry: BufferGeometry | null, material: Material, groupOrder: number, z: number, group: Group | null): void;
    unshift(object: Object3D, geometry: BufferGeometry | null, material: Material, groupOrder: number, z: number, group: Group | null): void;
    sort(opaqueSort: (a: any, b: any) => number, transparentSort: (a: any, b: any) => number, reversedDepth: boolean): void;
    finish(): void;
}
declare class WebGLRenderLists {
    constructor(properties: WebGLProperties);
    dispose(): void;
    get(scene: Scene, renderCallDepth: number): WebGLRenderList;
}
export interface WebGLAttribute {
    buffer: WebGLBuffer;
    type: number;
    bytesPerElement: number;
    version: number;
    size: number;
}
declare class WebGLAttributes {
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
    get(attribute: BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute): WebGLAttribute | undefined;
    remove(attribute: BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute): void;
    update(attribute: BufferAttribute | InterleavedBufferAttribute | GLBufferAttribute, bufferType: number): void;
}
declare class WebGLBindingStates {
    constructor(gl: WebGLRenderingContext, attributes: WebGLAttributes);
    setup(object: Object3D, material: Material, program: WebGLProgram$1, geometry: BufferGeometry, index: BufferAttribute): void;
    reset(): void;
    resetDefaultState(): void;
    dispose(): void;
    releaseStatesOfGeometry(): void;
    releaseStatesOfProgram(): void;
    initAttributes(): void;
    enableAttribute(attribute: number): void;
    disableUnusedAttributes(): void;
}
declare class WebGLGeometries {
    constructor(gl: WebGLRenderingContext, attributes: WebGLAttributes, info: WebGLInfo);
    get(object: Object3D, geometry: BufferGeometry): BufferGeometry;
    update(geometry: BufferGeometry): void;
    getWireframeAttribute(geometry: BufferGeometry): BufferAttribute;
    dispose(): void;
}
declare class WebGLObjects {
    constructor(gl: WebGLRenderingContext, geometries: WebGLGeometries, attributes: WebGLAttributes, bindingStates: WebGLBindingStates, info: WebGLInfo);
    update(object: Object3D): BufferGeometry;
    dispose(): void;
}
declare class WebGLShadowMap {
    constructor(_renderer: WebGLRenderer, _objects: WebGLObjects, _capabilities: WebGLCapabilities);
    enabled: boolean;
    autoUpdate: boolean;
    needsUpdate: boolean;
    type: ShadowMapType;
    render(shadowsArray: Light[], scene: Scene, camera: Camera): void;
}
declare class WebGLRenderTarget<TTexture extends Texture | Texture[] = Texture> extends RenderTarget<TTexture> {
    constructor(width?: number, height?: number, options?: RenderTargetOptions);
    readonly isWebGLRenderTarget: true;
}
declare class WebGLColorBuffer {
    setMask(colorMask: boolean): void;
    setLocked(lock: boolean): void;
    setClear(r: number, g: number, b: number, a: number, premultipliedAlpha: boolean): void;
    reset(): void;
}
declare class WebGLDepthBuffer {
    constructor();
    setReversed(value: boolean): void;
    getReversed(): boolean;
    setTest(depthTest: boolean): void;
    setMask(depthMask: boolean): void;
    setFunc(depthFunc: DepthModes): void;
    setLocked(lock: boolean): void;
    setClear(depth: number): void;
    reset(): void;
}
declare class WebGLStencilBuffer {
    constructor();
    setTest(stencilTest: boolean): void;
    setMask(stencilMask: number): void;
    setFunc(stencilFunc: number, stencilRef: number, stencilMask: number): void;
    setOp(stencilFail: number, stencilZFail: number, stencilZPass: number): void;
    setLocked(lock: boolean): void;
    setClear(stencil: number): void;
    reset(): void;
}
declare class WebGLState {
    constructor(gl: WebGLRenderingContext, extensions: WebGLExtensions);
    buffers: {
        color: WebGLColorBuffer;
        depth: WebGLDepthBuffer;
        stencil: WebGLStencilBuffer;
    };
    enable(id: number): void;
    disable(id: number): void;
    bindFramebuffer(target: number, framebuffer: WebGLFramebuffer | null): void;
    drawBuffers(renderTarget: WebGLRenderTarget | null, framebuffer: WebGLFramebuffer | null): void;
    useProgram(program: WebGLProgram): boolean;
    setBlending(blending: Blending, blendEquation?: BlendingEquation, blendSrc?: BlendingSrcFactor, blendDst?: BlendingDstFactor, blendEquationAlpha?: BlendingEquation, blendSrcAlpha?: BlendingSrcFactor, blendDstAlpha?: BlendingDstFactor, premultiplyAlpha?: boolean): void;
    setMaterial(material: Material, frontFaceCW: boolean, hardwareClippingPlanes: number): void;
    setFlipSided(flipSided: boolean): void;
    setCullFace(cullFace: CullFace): void;
    setLineWidth(width: number): void;
    setPolygonOffset(polygonoffset: boolean, factor?: number, units?: number): void;
    setScissorTest(scissorTest: boolean): void;
    activeTexture(webglSlot: number): void;
    bindTexture(webglType: number, webglTexture: WebGLTexture, webglSlot?: number): void;
    unbindTexture(): void;
    pixelStorei(name: GLenum, value: GLint | GLboolean): void;
    getParameter(name: GLenum): unknown;
    compressedTexImage2D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, border: GLint, imageSize: GLsizei, offset: GLintptr): void;
    compressedTexImage2D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, border: GLint, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): void;
    compressedTexImage3D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, imageSize: GLsizei, offset: GLintptr): void;
    compressedTexImage3D(target: GLenum, level: GLint, internalformat: GLenum, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, format: GLenum, type: GLenum, source: TexImageSource): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, pboOffset: GLintptr): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, source: TexImageSource): void;
    texSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: number): void;
    texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, pboOffset: GLintptr): void;
    texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, source: TexImageSource): void;
    texSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, type: GLenum, srcData: ArrayBufferView | null, srcOffset?: number): void;
    compressedTexSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, imageSize: GLsizei, offset: GLintptr): void;
    compressedTexSubImage2D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, width: GLsizei, height: GLsizei, format: GLenum, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): void;
    compressedTexSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, imageSize: GLsizei, offset: GLintptr): void;
    compressedTexSubImage3D(target: GLenum, level: GLint, xoffset: GLint, yoffset: GLint, zoffset: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, format: GLenum, srcData: ArrayBufferView, srcOffset?: number, srcLengthOverride?: GLuint): void;
    texStorage2D(target: GLenum, levels: GLsizei, internalformat: GLenum, width: GLsizei, height: GLsizei): void;
    texStorage3D(target: GLenum, levels: GLsizei, internalformat: GLenum, width: GLsizei, height: GLsizei, depth: GLsizei): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, pixels: ArrayBufferView | null): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, format: GLenum, type: GLenum, source: TexImageSource): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, pboOffset: GLintptr): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, source: TexImageSource): void;
    texImage2D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, border: GLint, format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: number): void;
    texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, pboOffset: GLintptr): void;
    texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, source: TexImageSource): void;
    texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, srcData: ArrayBufferView | null): void;
    texImage3D(target: GLenum, level: GLint, internalformat: GLint, width: GLsizei, height: GLsizei, depth: GLsizei, border: GLint, format: GLenum, type: GLenum, srcData: ArrayBufferView, srcOffset: number): void;
    scissor(scissor: Vector4): void;
    viewport(viewport: Vector4): void;
    reset(): void;
}
export interface GPUTexture {
}
declare class ExternalTexture extends Texture<null> {
    sourceTexture: WebGLTexture | GPUTexture | null;
    readonly isExternalTexture: true;
    constructor(sourceTexture?: WebGLTexture | GPUTexture | null);
}
export type WebXRCamera = PerspectiveCamera & {
    viewport: Vector4;
};
export type WebXRArrayCamera = Omit<ArrayCamera, "cameras"> & {
    cameras: [
        WebXRCamera,
        WebXRCamera
    ];
};
export interface WebXRManagerEventMap {
    sessionstart: {};
    sessionend: {};
    planeadded: {
        data: XRPlane;
    };
    planeremoved: {
        data: XRPlane;
    };
    planechanged: {
        data: XRPlane;
    };
    planesdetected: {
        data: XRPlaneSet;
    };
}
declare class WebXRManager<TEventMap extends WebXRManagerEventMap = WebXRManagerEventMap> extends EventDispatcher<TEventMap> {
    cameraAutoUpdate: boolean;
    enabled: boolean;
    isPresenting: boolean;
    constructor(renderer: WebGLRenderer, gl: WebGLRenderingContext);
    getController: (index: number) => XRTargetRaySpace;
    getControllerGrip: (index: number) => XRGripSpace;
    getHand: (index: number) => XRHandSpace;
    setFramebufferScaleFactor: (value: number) => void;
    setReferenceSpaceType: (value: XRReferenceSpaceType) => void;
    getReferenceSpace: () => XRReferenceSpace | null;
    setReferenceSpace: (value: XRReferenceSpace) => void;
    getBaseLayer: () => XRWebGLLayer | XRProjectionLayer;
    getBinding: () => XRWebGLBinding;
    getFrame: () => XRFrame;
    getSession: () => XRSession | null;
    setSession: (value: XRSession | null) => Promise<void>;
    getEnvironmentBlendMode: () => XREnvironmentBlendMode | undefined;
    getDepthTexture: () => ExternalTexture | null;
    updateCamera: (camera: PerspectiveCamera) => void;
    getCamera: () => WebXRArrayCamera;
    getFoveation: () => number | undefined;
    setFoveation: (value: number) => void;
    hasDepthSensing: () => boolean;
    getDepthSensingMesh: () => Mesh | null;
    getCameraTexture: (xrCamera: WebXRCamera) => ExternalTexture | undefined;
    setAnimationLoop: (callback: XRFrameRequestCallback | null) => void;
    dispose: () => void;
}
export interface WebGLRendererParameters extends WebGLCapabilitiesParameters {
    canvas?: HTMLCanvasElement | OffscreenCanvas$1 | undefined;
    context?: WebGLRenderingContext | undefined;
    alpha?: boolean | undefined;
    premultipliedAlpha?: boolean | undefined;
    antialias?: boolean | undefined;
    stencil?: boolean | undefined;
    preserveDrawingBuffer?: boolean | undefined;
    powerPreference?: WebGLPowerPreference | undefined;
    depth?: boolean | undefined;
    failIfMajorPerformanceCaveat?: boolean | undefined;
    outputBufferType?: TextureDataType | undefined;
}
export interface WebGLDebug {
    checkShaderErrors: boolean;
    diagnostics: {
        keywords: boolean;
    };
    onShaderError: ((gl: WebGLRenderingContext, program: WebGLProgram$1, glVertexShader: WebGLShader, glFragmentShader: WebGLShader) => void) | null;
}
export interface Effect {
    needsDepthTexture?: boolean;
    setSize(width: number, height: number): void;
    setDepthTexture?(depthTexture: DepthTexture): void;
    render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget, deltaTime: number, maskActive: boolean): void;
}
export interface NodesHandler {
    setRenderer(renderer: WebGLRenderer): void;
    renderStart(scene: Object3D, camera: Camera): void;
    renderEnd(): void;
    build(material: Material, object: Object3D, parameters: WebGLProgramParametersWithUniforms): void;
}
export class WebGLRenderer {
    constructor(parameters?: WebGLRendererParameters);
    domElement: HTMLCanvasElement;
    autoClear: boolean;
    autoClearColor: boolean;
    autoClearDepth: boolean;
    autoClearStencil: boolean;
    debug: WebGLDebug;
    sortObjects: boolean;
    clippingPlanes: Plane[];
    localClippingEnabled: boolean;
    extensions: WebGLExtensions;
    get outputColorSpace(): string;
    set outputColorSpace(colorSpace: string);
    get coordinateSystem(): typeof WebGLCoordinateSystem;
    toneMapping: ToneMapping;
    toneMappingExposure: number;
    transmissionResolutionScale: number;
    info: WebGLInfo;
    shadowMap: WebGLShadowMap;
    capabilities: WebGLCapabilities;
    properties: WebGLProperties;
    renderLists: WebGLRenderLists;
    state: WebGLState;
    xr: WebXRManager;
    getContext(): WebGLRenderingContext | WebGL2RenderingContext;
    getContextAttributes(): WebGLContextAttributes;
    forceContextLoss(): void;
    forceContextRestore(): void;
    getPixelRatio(): number;
    setPixelRatio(value: number): void;
    getSize(target: Vector2): Vector2;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    getDrawingBufferSize(target: Vector2): Vector2;
    setDrawingBufferSize(width: number, height: number, pixelRatio: number): void;
    setEffects(effects: Effect[] | null): void;
    getCurrentViewport(target: Vector4): Vector4;
    getViewport(target: Vector4): Vector4;
    setViewport(x: Vector4 | number, y?: number, width?: number, height?: number): void;
    getScissor(target: Vector4): Vector4;
    setScissor(x: Vector4 | number, y?: number, width?: number, height?: number): void;
    getScissorTest(): boolean;
    setScissorTest(enable: boolean): void;
    setOpaqueSort(method: ((a: any, b: any) => number) | null): void;
    setTransparentSort(method: ((a: any, b: any) => number) | null): void;
    getClearColor(target: Color): Color;
    setClearColor(color: ColorRepresentation, alpha?: number): void;
    getClearAlpha(): number;
    setClearAlpha(alpha: number): void;
    clear(color?: boolean, depth?: boolean, stencil?: boolean): void;
    clearColor(): void;
    clearDepth(): void;
    clearStencil(): void;
    setNodesHandler(nodesHandler: NodesHandler): void;
    dispose(): void;
    renderBufferDirect(camera: Camera, scene: Scene, geometry: BufferGeometry, material: Material, object: Object3D, group: GeometryGroup): void;
    setAnimationLoop(callback: XRFrameRequestCallback | null): void;
    compile: (scene: Object3D, camera: Camera, targetScene?: Scene | null) => Set<Material>;
    compileAsync: (scene: Object3D, camera: Camera, targetScene?: Scene | null) => Promise<Object3D>;
    render(scene: Object3D, camera: Camera): void;
    getActiveCubeFace(): number;
    getActiveMipmapLevel(): number;
    getRenderTarget(): WebGLRenderTarget | null;
    setRenderTarget(renderTarget: WebGLRenderTarget | WebGLRenderTarget<Texture[]> | null, activeCubeFace?: number, activeMipmapLevel?: number): void;
    readRenderTargetPixels(renderTarget: WebGLRenderTarget | WebGLRenderTarget<Texture[]>, x: number, y: number, width: number, height: number, buffer: TypedArray, activeCubeFaceIndex?: number, textureIndex?: number): void;
    readRenderTargetPixelsAsync(renderTarget: WebGLRenderTarget | WebGLRenderTarget<Texture[]>, x: number, y: number, width: number, height: number, buffer: TypedArray, activeCubeFaceIndex?: number, textureIndex?: number): Promise<TypedArray>;
    copyFramebufferToTexture(texture: Texture, position?: Vector2 | null, level?: number): void;
    copyTextureToTexture(srcTexture: Texture, dstTexture: Texture, srcRegion?: Box2 | Box3 | null, dstPosition?: Vector2 | Vector3 | null, srcLevel?: number, dstLevel?: number): void;
    initRenderTarget(target: WebGLRenderTarget): void;
    initTexture(texture: Texture): void;
    resetState(): void;
}
export interface WebGLProgramParameters {
    shaderID: string;
    shaderType: string;
    shaderName: string;
    vertexShader: string;
    fragmentShader: string;
    defines: {
        [define: string]: string | number | boolean;
    } | undefined;
    customVertexShaderID: string | undefined;
    customFragmentShaderID: string | undefined;
    isRawShaderMaterial: boolean;
    glslVersion: GLSLVersion | null | undefined;
    precision: "lowp" | "mediump" | "highp";
    batching: boolean;
    batchingColor: boolean;
    instancing: boolean;
    instancingColor: boolean;
    instancingMorph: boolean;
    outputColorSpace: string;
    alphaToCoverage: boolean;
    map: boolean;
    matcap: boolean;
    envMap: boolean;
    envMapMode: Mapping | false;
    envMapCubeUVHeight: number | null;
    aoMap: boolean;
    lightMap: boolean;
    bumpMap: boolean;
    normalMap: boolean;
    displacementMap: boolean;
    emissiveMap: boolean;
    normalMapObjectSpace: boolean;
    normalMapTangentSpace: boolean;
    packedNormalMap: boolean;
    metalnessMap: boolean;
    roughnessMap: boolean;
    anisotropy: boolean;
    anisotropyMap: boolean;
    clearcoat: boolean;
    clearcoatMap: boolean;
    clearcoatNormalMap: boolean;
    clearcoatRoughnessMap: boolean;
    diffuseRoughness: boolean;
    diffuseRoughnessMap: boolean;
    dispersion: boolean;
    retroreflection: boolean;
    iridescence: boolean;
    iridescenceMap: boolean;
    iridescenceThicknessMap: boolean;
    sheen: boolean;
    sheenColorMap: boolean;
    sheenRoughnessMap: boolean;
    specularMap: boolean;
    specularColorMap: boolean;
    specularIntensityMap: boolean;
    transmission: boolean;
    transmissionMap: boolean;
    thicknessMap: boolean;
    gradientMap: boolean;
    opaque: boolean;
    alphaMap: boolean;
    alphaTest: boolean;
    alphaHash: boolean;
    combine: Combine | undefined;
    mapUv: string | false;
    aoMapUv: string | false;
    lightMapUv: string | false;
    bumpMapUv: string | false;
    normalMapUv: string | false;
    displacementMapUv: string | false;
    emissiveMapUv: string | false;
    metalnessMapUv: string | false;
    roughnessMapUv: string | false;
    anisotropyMapUv: string | false;
    clearcoatMapUv: string | false;
    clearcoatNormalMapUv: string | false;
    clearcoatRoughnessMapUv: string | false;
    diffuseRoughnessMapUv: string | false;
    iridescenceMapUv: string | false;
    iridescenceThicknessMapUv: string | false;
    sheenColorMapUv: string | false;
    sheenRoughnessMapUv: string | false;
    specularMapUv: string | false;
    specularColorMapUv: string | false;
    specularIntensityMapUv: string | false;
    transmissionMapUv: string | false;
    thicknessMapUv: string | false;
    alphaMapUv: string | false;
    vertexTangents: boolean;
    vertexNormals: boolean;
    vertexColors: boolean;
    vertexAlphas: boolean;
    vertexUv1s: boolean;
    vertexUv2s: boolean;
    vertexUv3s: boolean;
    pointsUvs: boolean;
    fog: boolean;
    useFog: boolean;
    fogExp2: boolean;
    flatShading: boolean;
    sizeAttenuation: boolean;
    logarithmicDepthBuffer: boolean;
    reverseDepthBuffer: boolean;
    skinning: boolean;
    hasPositionAttribute: boolean;
    morphTargets: boolean;
    morphNormals: boolean;
    morphColors: boolean;
    morphTargetsCount: number;
    morphTextureStride: number;
    numSunLights: number;
    numDirLights: number;
    numPointLights: number;
    numSpotLights: number;
    numSpotLightMaps: number;
    numRectAreaLights: number;
    numHemiLights: number;
    numSunLightShadows: number;
    numDirLightShadows: number;
    numPointLightShadows: number;
    numSpotLightShadows: number;
    numSpotLightShadowsWithMaps: number;
    numLightProbes: number;
    numLightProbeGrids: number;
    numClippingPlanes: number;
    numClipIntersection: number;
    dithering: boolean;
    shadowMapEnabled: boolean;
    shadowMapType: ShadowMapType;
    toneMapping: ToneMapping;
    decodeVideoTexture: boolean;
    decodeVideoTextureEmissive: boolean;
    premultipliedAlpha: boolean;
    doubleSided: boolean;
    flipSided: boolean;
    useDepthPacking: boolean;
    depthPacking: DepthPackingStrategies | 0;
    index0AttributeName: string | undefined;
    extensionClipCullDistance: boolean;
    extensionMultiDraw: boolean;
    rendererExtensionParallelShaderCompile: boolean;
    customProgramCacheKey: string;
}
export interface WebGLProgramParametersWithUniforms extends WebGLProgramParameters {
    uniforms: {
        [uniform: string]: IUniform;
    };
}
export interface MaterialProperties {
    name: string;
    blending: Blending;
    side: Side;
    vertexColors: boolean;
    opacity: number;
    transparent: boolean;
    alphaHash: boolean;
    blendSrc: BlendingSrcFactor;
    blendDst: BlendingDstFactor;
    blendEquation: BlendingEquation;
    blendSrcAlpha: BlendingSrcFactor | null;
    blendDstAlpha: BlendingDstFactor | null;
    blendEquationAlpha: BlendingEquation | null;
    blendColor: Color;
    blendAlpha: number;
    depthFunc: DepthModes;
    depthTest: boolean;
    depthWrite: boolean;
    stencilWriteMask: number;
    stencilFunc: StencilFunc;
    stencilRef: number;
    stencilFuncMask: number;
    stencilFail: StencilOp;
    stencilZFail: StencilOp;
    stencilZPass: StencilOp;
    stencilWrite: boolean;
    clippingPlanes: Array<Plane> | null;
    clipIntersection: boolean;
    clipShadows: boolean;
    shadowSide: Side | null;
    colorWrite: boolean;
    precision: ("highp" | "mediump" | "lowp") | null;
    polygonOffset: boolean;
    polygonOffsetFactor: number;
    polygonOffsetUnits: number;
    dithering: boolean;
    alphaToCoverage: boolean;
    premultipliedAlpha: boolean;
    forceSinglePass: boolean;
    allowOverride: boolean;
    visible: boolean;
    toneMapped: boolean;
    userData: Record<string, any>;
    set alphaTest(value: number);
    get alphaTest(): number;
}
export type MapColorPropertiesToColorRepresentations<T> = {
    [P in keyof T]: T[P] extends Color ? ColorRepresentation : T[P];
};
export interface MaterialParameters extends Partial<MapColorPropertiesToColorRepresentations<MaterialProperties>> {
}
export interface MaterialJSON {
    metadata: {
        version: number;
        type: string;
        generator: string;
    };
    uuid: string;
    type: string;
    name?: string;
    color?: number;
    roughness?: number;
    metalness?: number;
    sheen?: number;
    sheenColor?: number;
    sheenRoughness?: number;
    emissive?: number;
    emissiveIntensity?: number;
    specular?: number;
    specularIntensity?: number;
    specularColor?: number;
    shininess?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    clearcoatMap?: string;
    clearcoatRoughnessMap?: string;
    clearcoatNormalMap?: string;
    clearcoatNormalScale?: Vector2Tuple;
    diffuseRoughness?: number;
    diffuseRoughnessMap?: string;
    dispersion?: number;
    iridescence?: number;
    iridescenceIOR?: number;
    iridescenceThicknessMinimum?: number;
    iridescenceThicknessMaximum?: number;
    iridescenceMap?: string;
    iridescenceThicknessMap?: string;
    anisotropy?: number;
    anisotropyRotation?: number;
    anisotropyMap?: string;
    map?: string;
    matcap?: string;
    alphaMap?: string;
    lightMap?: string;
    lightMapIntensity?: number;
    aoMap?: string;
    aoMapIntensity?: number;
    bumpMap?: string;
    bumpScale?: number;
    normalMap?: string;
    normalMapType?: NormalMapTypes;
    normalScale?: Vector2Tuple;
    displacementMap?: string;
    displacementScale?: number;
    displacementBias?: number;
    roughnessMap?: string;
    metalnessMap?: string;
    emissiveMap?: string;
    specularMap?: string;
    specularIntensityMap?: string;
    specularColorMap?: string;
    envMap?: string;
    combine?: Combine;
    envMapRotation?: EulerTuple;
    envMapIntensity?: number;
    reflectivity?: number;
    refractionRatio?: number;
    gradientMap?: string;
    transmission?: number;
    transmissionMap?: string;
    thickness?: number;
    thicknessMap?: string;
    attenuationDistance?: number;
    attenuationColor?: number;
    size?: number;
    shadowSide?: number;
    sizeAttenuation?: boolean;
    blending?: Blending;
    side?: Side;
    vertexColors?: boolean;
    opacity?: number;
    transparent?: boolean;
    blendSrc?: BlendingSrcFactor;
    blendDst?: BlendingDstFactor;
    blendEquation?: BlendingEquation;
    blendSrcAlpha?: number | null;
    blendDstAlpha?: number | null;
    blendEquationAlpha?: number | null;
    blendColor?: number;
    blendAlpha?: number;
    depthFunc?: DepthModes;
    depthTest?: boolean;
    depthWrite?: boolean;
    colorWrite?: boolean;
    clippingPlanes?: PlaneJSON[];
    clipIntersection?: boolean;
    clipShadows?: boolean;
    stencilWriteMask?: number;
    stencilFunc?: StencilFunc;
    stencilRef?: number;
    stencilFuncMask?: number;
    stencilFail?: StencilOp;
    stencilZFail?: StencilOp;
    stencilZPass?: StencilOp;
    stencilWrite?: boolean;
    rotation?: number;
    depthPacking?: DepthPackingStrategies;
    polygonOffset?: boolean;
    polygonOffsetFactor?: number;
    polygonOffsetUnits?: number;
    linewidth?: number;
    linecap?: string;
    linejoin?: string;
    dashSize?: number;
    gapSize?: number;
    scale?: number;
    dithering?: boolean;
    alphaTest?: number;
    alphaHash?: boolean;
    alphaToCoverage?: boolean;
    premultipliedAlpha?: boolean;
    forceSinglePass?: boolean;
    wireframe?: boolean;
    wireframeLinewidth?: number;
    wireframeLinecap?: string;
    wireframeLinejoin?: string;
    flatShading?: boolean;
    visible?: boolean;
    toneMapped?: boolean;
    fog?: boolean;
    userData?: Record<string, unknown>;
    textures?: Array<Omit<TextureJSON, "metadata">>;
    images?: TextureSourceJSON[];
}
export interface MaterialEventMap {
    dispose: {};
}
declare class Material<TEventMap extends MaterialEventMap = MaterialEventMap> extends EventDispatcher<TEventMap> {
    readonly isMaterial: boolean;
    readonly id: number;
    readonly uuid: string;
    type: string;
    readonly version: number;
    defines?: Record<string, unknown> | undefined;
    onBeforeRender(renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry, object: Object3D, group: Group): void;
    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void;
    customProgramCacheKey(): string;
    setValues(values?: MaterialParameters): void;
    toJSON(meta?: JSONMeta): MaterialJSON;
    fromJSON(json: MaterialJSON, textures: Record<string, Texture>): this;
    clone(): this;
    copy(source: Material): this;
    dispose(): void;
    set needsUpdate(value: boolean);
}
export interface Material extends MaterialProperties {
}
export interface SkeletonJSON {
    metadata: {
        version: number;
        type: string;
        generator: string;
    };
    bones: string[];
    boneInverses: Matrix4Tuple[];
    uuid: string;
}
declare class Ray {
    constructor(origin?: Vector3, direction?: Vector3);
    origin: Vector3;
    direction: Vector3;
    set(origin: Vector3, direction: Vector3): Ray;
    clone(): this;
    copy(ray: Ray): this;
    at(t: number, target: Vector3): Vector3;
    lookAt(v: Vector3): Ray;
    recast(t: number): Ray;
    closestPointToPoint(point: Vector3, target: Vector3): Vector3;
    distanceToPoint(point: Vector3): number;
    distanceSqToPoint(point: Vector3): number;
    distanceSqToSegment(v0: Vector3, v1: Vector3, optionalPointOnRay?: Vector3, optionalPointOnSegment?: Vector3): number;
    intersectSphere(sphere: Sphere, target: Vector3): Vector3 | null;
    intersectsSphere(sphere: Sphere): boolean;
    distanceToPlane(plane: Plane): number;
    intersectPlane(plane: Plane, target: Vector3): Vector3 | null;
    intersectsPlane(plane: Plane): boolean;
    intersectBox(box: Box3, target: Vector3): Vector3 | null;
    intersectsBox(box: Box3): boolean;
    intersectTriangle(a: Vector3, b: Vector3, c: Vector3, backfaceCulling: boolean, target: Vector3): Vector3 | null;
    applyMatrix4(matrix4: Matrix4): Ray;
    equals(ray: Ray): boolean;
    isIntersectionBox(b: any): any;
    isIntersectionPlane(p: any): any;
    isIntersectionSphere(s: any): any;
}
export interface Face {
    a: number;
    b: number;
    c: number;
    normal: Vector3;
    materialIndex: number;
}
export interface Intersection<TIntersected extends Object3D = Object3D> {
    distance: number;
    distanceToRay?: number | undefined;
    point: Vector3;
    index?: number | undefined;
    face?: Face | null | undefined;
    faceIndex?: number | null | undefined;
    barycoord?: Vector3 | null;
    object: TIntersected;
    uv?: Vector2 | undefined;
    uv1?: Vector2 | undefined;
    normal?: Vector3;
    instanceId?: number | undefined;
    pointOnLine?: Vector3;
    batchId?: number;
}
export interface RaycasterParameters {
    Mesh: any;
    Line: {
        threshold: number;
    };
    Line2?: {
        threshold: number;
    };
    LOD: any;
    Points: {
        threshold: number;
    };
    Sprite: any;
}
declare class Raycaster {
    constructor(origin?: Vector3, direction?: Vector3, near?: number, far?: number);
    ray: Ray;
    near: number;
    far: number;
    camera: Camera;
    layers: Layers;
    params: RaycasterParameters;
    set(origin: Vector3, direction: Vector3): void;
    setFromCamera(coords: Vector2, camera: Camera): void;
    setFromXRController(controller: XRTargetRaySpace): this;
    intersectObject<TIntersected extends Object3D>(object: Object3D, recursive?: boolean, optionalTarget?: Array<Intersection<TIntersected>>): Array<Intersection<TIntersected>>;
    intersectObjects<TIntersected extends Object3D>(objects: Object3D[], recursive?: boolean, optionalTarget?: Array<Intersection<TIntersected>>): Array<Intersection<TIntersected>>;
}
export interface Object3DJSONObject {
    uuid: string;
    type: string;
    name?: string;
    castShadow?: boolean;
    receiveShadow?: boolean;
    visible?: boolean;
    frustumCulled?: boolean;
    renderOrder?: number;
    static?: boolean;
    userData?: Record<string, unknown>;
    layers: number;
    matrix: Matrix4Tuple;
    up: Vector3Tuple;
    pivot?: Vector3Tuple;
    matrixAutoUpdate?: boolean;
    material?: string | string[];
    children?: string[];
    animations?: string[];
}
export interface Object3DJSON {
    metadata?: {
        version: number;
        type: string;
        generator: string;
    };
    object: Object3DJSONObject;
}
export interface JSONMeta {
    geometries: Record<string, BufferGeometryJSON>;
    materials: Record<string, MaterialJSON>;
    textures: Record<string, TextureJSON>;
    images: Record<string, TextureSourceJSON>;
    shapes: Record<string, ShapeJSON>;
    skeletons: Record<string, SkeletonJSON>;
    animations: Record<string, AnimationClipJSON>;
    nodes: Record<string, unknown>;
}
export interface Object3DEventMap {
    added: {};
    removed: {};
    childadded: {
        child: Object3D;
    };
    childremoved: {
        child: Object3D;
    };
    dispose: {};
}
declare class Object3D<TEventMap extends Object3DEventMap = Object3DEventMap> extends EventDispatcher<TEventMap> {
    constructor();
    readonly isObject3D: true;
    readonly id: number;
    uuid: string;
    name: string;
    readonly type: string;
    parent: Object3D | null;
    children: Object3D[];
    up: Vector3;
    readonly position: Vector3;
    readonly rotation: Euler;
    readonly quaternion: Quaternion;
    readonly scale: Vector3;
    readonly modelViewMatrix: Matrix4;
    readonly normalMatrix: Matrix3;
    matrix: Matrix4;
    matrixWorld: Matrix4;
    matrixAutoUpdate: boolean;
    matrixWorldAutoUpdate: boolean;
    matrixWorldNeedsUpdate: boolean;
    layers: Layers;
    visible: boolean;
    castShadow: boolean;
    receiveShadow: boolean;
    frustumCulled: boolean;
    renderOrder: number;
    animations: AnimationClip[];
    customDepthMaterial?: Material | undefined;
    customDistanceMaterial?: Material | undefined;
    static: boolean;
    userData: Record<string, any>;
    pivot: Vector3 | null;
    onBeforeShadow(renderer: WebGLRenderer, scene: Scene, camera: Camera, shadowCamera: Camera, geometry: BufferGeometry, depthMaterial: Material, group: Group): void;
    onAfterShadow(renderer: WebGLRenderer, scene: Scene, camera: Camera, shadowCamera: Camera, geometry: BufferGeometry, depthMaterial: Material, group: Group): void;
    onBeforeRender(renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry, material: Material, group: Group): void;
    onAfterRender(renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry, material: Material, group: Group): void;
    static DEFAULT_UP: Vector3;
    static DEFAULT_MATRIX_AUTO_UPDATE: boolean;
    static DEFAULT_MATRIX_WORLD_AUTO_UPDATE: boolean;
    applyMatrix4(matrix: Matrix4): void;
    applyQuaternion(quaternion: Quaternion): this;
    setRotationFromAxisAngle(axis: Vector3, angle: number): void;
    setRotationFromEuler(euler: Euler): void;
    setRotationFromMatrix(m: Matrix4): void;
    setRotationFromQuaternion(q: Quaternion): void;
    rotateOnAxis(axis: Vector3, angle: number): this;
    rotateOnWorldAxis(axis: Vector3, angle: number): this;
    rotateX(angle: number): this;
    rotateY(angle: number): this;
    rotateZ(angle: number): this;
    translateOnAxis(axis: Vector3, distance: number): this;
    translateX(distance: number): this;
    translateY(distance: number): this;
    translateZ(distance: number): this;
    localToWorld(vector: Vector3): Vector3;
    worldToLocal(vector: Vector3): Vector3;
    lookAt(vector: Vector3): void;
    lookAt(x: number, y: number, z: number): void;
    add(...object: Object3D[]): this;
    remove(...object: Object3D[]): this;
    removeFromParent(): this;
    clear(): this;
    attach(object: Object3D): this;
    getObjectById(id: number): Object3D | undefined;
    getObjectByName(name: string): Object3D | undefined;
    getObjectByProperty(name: string, value: any): Object3D | undefined;
    getObjectsByProperty(name: string, value: any, optionalTarget?: Object3D[]): Object3D[];
    getWorldPosition(target: Vector3): Vector3;
    getWorldQuaternion(target: Quaternion): Quaternion;
    getWorldScale(target: Vector3): Vector3;
    getWorldDirection(target: Vector3): Vector3;
    raycast(raycaster: Raycaster, intersects: Intersection[]): void;
    intersectsFrustum(frustum: Frustum | FrustumArray): boolean;
    traverse(callback: (object: Object3D) => any): void;
    traverseVisible(callback: (object: Object3D) => any): void;
    traverseAncestors(callback: (object: Object3D) => any): void;
    updateMatrix(): void;
    updateMatrixWorld(force?: boolean): void;
    updateWorldMatrix(updateParents: boolean, updateChildren: boolean, force?: boolean): void;
    toJSON(meta?: JSONMeta): Object3DJSON;
    clone(recursive?: boolean): this;
    copy(object: Object3D, recursive?: boolean): this;
    dispose(): void;
}
export interface ControlsEventMap {
}
declare abstract class Controls<TEventMap extends ControlsEventMap = ControlsEventMap, TObject extends Object3D = Object3D> extends EventDispatcher<TEventMap> {
    object: TObject;
    domElement: HTMLElement | SVGElement | null;
    enabled: boolean;
    constructor(object: TObject, domElement?: HTMLElement | SVGElement | null);
    connect(element: HTMLElement | SVGElement): void;
    disconnect(): void;
    dispose(): void;
    update(delta: number): void;
}
export class SphereGeometry extends BufferGeometry {
    constructor(radius?: number, widthSegments?: number, heightSegments?: number, phiStart?: number, phiLength?: number, thetaStart?: number, thetaLength?: number);
    override readonly type: string | "SphereGeometry";
    readonly parameters: {
        readonly radius: number;
        readonly widthSegments: number;
        readonly heightSegments: number;
        readonly phiStart: number;
        readonly phiLength: number;
        readonly thetaStart: number;
        readonly thetaLength: number;
    };
    static fromJSON(data: {}): SphereGeometry;
}
export class Line<TGeometry extends BufferGeometry = BufferGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Object3D<TEventMap> {
    constructor(geometry?: TGeometry, material?: TMaterial);
    readonly isLine: true;
    override readonly type: string | "Line";
    geometry: TGeometry;
    material: TMaterial;
    morphTargetInfluences?: number[] | undefined;
    morphTargetDictionary?: {
        [key: string]: number;
    } | undefined;
    computeLineDistances(): this;
    updateMorphTargets(): void;
    intersectsFrustum(frustum: Frustum | FrustumArray): boolean;
}
declare class LoadingManager {
    constructor(onLoad?: () => void, onProgress?: (url: string, loaded: number, total: number) => void, onError?: (url: string) => void);
    onStart: ((url: string, loaded: number, total: number) => void) | undefined;
    onLoad: () => void;
    onProgress: (url: string, loaded: number, total: number) => void;
    onError: (url: string) => void;
    abortController: AbortController;
    itemStart: (url: string) => void;
    itemEnd: (url: string) => void;
    itemError: (url: string) => void;
    resolveURL: (url: string) => string;
    setURLModifier: (callback?: (url: string) => string) => this;
    addHandler: (regex: RegExp, loader: Loader) => this;
    removeHandler: (regex: RegExp) => this;
    getHandler: (file: string) => Loader | null;
    abort: () => this;
}
declare class Loader<TData = unknown, TUrl = string> {
    constructor(manager?: LoadingManager);
    crossOrigin: string;
    withCredentials: boolean;
    path: string;
    resourcePath: string;
    manager: LoadingManager;
    requestHeader: {
        [header: string]: string;
    };
    priority: "high" | "low" | "auto";
    cache: "default" | "no-store" | "reload" | "no-cache" | "force-cache";
    load(url: TUrl, onLoad: (data: TData) => void, onProgress?: (event: ProgressEvent) => void, onError?: (err: unknown) => void): void;
    loadAsync(url: TUrl, onProgress?: (event: ProgressEvent) => void): Promise<TData>;
    setCrossOrigin(crossOrigin: string): this;
    setWithCredentials(value: boolean): this;
    setPath(path: string): this;
    setResourcePath(resourcePath: string): this;
    setRequestHeader(requestHeader: {
        [header: string]: string;
    }): this;
    setPriority(value: "high" | "low" | "auto"): this;
    setCache(value: "default" | "no-store" | "reload" | "no-cache" | "force-cache"): this;
    abort(): this;
    static DEFAULT_MATERIAL_NAME: string;
}
export class TextureLoader extends Loader<Texture<HTMLImageElement>> {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad?: (data: Texture<HTMLImageElement>) => void, onProgress?: (event: ProgressEvent) => void, onError?: (err: unknown) => void): Texture<HTMLImageElement>;
}
export class Points<TGeometry extends BufferGeometry<NormalOrGLBufferAttributes> = BufferGeometry, TMaterial extends Material | Material[] = Material | Material[], TEventMap extends Object3DEventMap = Object3DEventMap> extends Object3D<TEventMap> {
    constructor(geometry?: TGeometry, material?: TMaterial);
    readonly isPoints: true;
    override readonly type: string | "Points";
    morphTargetInfluences?: number[] | undefined;
    morphTargetDictionary?: {
        [key: string]: number;
    } | undefined;
    geometry: TGeometry;
    material: TMaterial;
    updateMorphTargets(): void;
    intersectsFrustum(frustum: Frustum | FrustumArray): boolean;
}
export interface OrbitControlsEventMap {
    change: {};
    start: {};
    end: {};
}
export declare class OrbitControls<TCamera extends Camera = Camera> extends Controls<OrbitControlsEventMap, TCamera> {
    target: Vector3;
    cursor: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minTargetRadius: number;
    maxTargetRadius: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    keyRotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    zoomToCursor: boolean;
    autoRotate: boolean;
    autoRotateSpeed: number;
    keys: {
        LEFT: string;
        UP: string;
        RIGHT: string;
        BOTTOM: string;
    };
    mouseButtons: {
        LEFT?: MOUSE | null | undefined;
        MIDDLE?: MOUSE | null | undefined;
        RIGHT?: MOUSE | null | undefined;
    };
    touches: {
        ONE?: TOUCH | null | undefined;
        TWO?: TOUCH | null | undefined;
    };
    target0: Vector3;
    position0: Vector3;
    zoom0: number;
    constructor(object: TCamera, domElement?: HTMLElement | SVGElement | null);
    set cursorStyle(type: "auto" | "grab");
    get cursorStyle(): "auto" | "grab";
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    getDistance(): number;
    listenToKeyEvents(domElement: HTMLElement | Window): void;
    stopListenToKeyEvents(): void;
    saveState(): void;
    reset(): void;
    pan(deltaX: number, deltaY: number): void;
    dollyIn(dollyScale: number): void;
    dollyOut(dollyScale: number): void;
    rotateLeft(angle: number): void;
    rotateUp(angle: number): void;
    update(deltaTime?: number | null): boolean;
}
export {};
