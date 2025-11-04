declare module 'react-simple-maps' {
    import { ComponentType, CSSProperties } from 'react';

    export interface GeoProjection {
        scale?: number;
        center?: [number, number];
        rotation?: [number, number, number];
    }

    export interface ComposableMapProps {
        projection?: string;
        projectionConfig?: GeoProjection;
        width?: number;
        height?: number;
        style?: CSSProperties;
        children?: React.ReactNode;
    }

    export interface ZoomableGroupProps {
        center?: [number, number];
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        children?: React.ReactNode;
    }

    export interface GeographiesProps {
        geography: string | object;
        children: (props: { geographies: any[] }) => React.ReactNode;
    }

    export interface GeographyProps {
        geography: any;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        style?: {
            default?: CSSProperties;
            hover?: CSSProperties;
            pressed?: CSSProperties;
        };
        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
        onClick?: () => void;
    }

    export const ComposableMap: ComponentType<ComposableMapProps>;
    export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
    export const Geographies: ComponentType<GeographiesProps>;
    export const Geography: ComponentType<GeographyProps>;
}
