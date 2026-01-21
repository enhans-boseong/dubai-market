// A2UI Core Types - Based on A2UI v0.9 Specification

// ============================================
// Message Types
// ============================================

export type A2UIMessage =
  | CreateSurfaceMessage
  | UpdateComponentsMessage
  | UpdateDataModelMessage
  | DeleteSurfaceMessage;

export interface CreateSurfaceMessage {
  type: 'createSurface';
  surfaceId: string;
  surfaceName?: string;
  rootId?: string;
}

export interface UpdateComponentsMessage {
  type: 'updateComponents';
  surfaceId: string;
  components: ComponentDefinition[];
}

export interface UpdateDataModelMessage {
  type: 'updateDataModel';
  surfaceId: string;
  dataModel: Record<string, unknown>;
}

export interface DeleteSurfaceMessage {
  type: 'deleteSurface';
  surfaceId: string;
}

// ============================================
// Component Types
// ============================================

export type ComponentType =
  | 'Text'
  | 'Button'
  | 'Column'
  | 'Row'
  | 'Card'
  | 'TextField'
  | 'CheckBox'
  | 'Image'
  | 'Divider'
  | 'List'
  | 'Tabs'
  | 'Icon'
  | 'Video'
  | 'DateTimeInput'
  | 'Slider';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  parentId?: string;
  childIds?: string[];
  visible?: boolean | string; // Can be boolean or binding expression
  style?: ComponentStyle;
}

export interface ComponentStyle {
  width?: string | number;
  height?: string | number;
  padding?: string | number;
  margin?: string | number;
  backgroundColor?: string;
  borderRadius?: string | number;
  border?: string;
  flex?: number;
  gap?: string | number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

// ============================================
// Individual Component Definitions
// ============================================

export interface TextComponent extends BaseComponent {
  type: 'Text';
  text: string;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean | string;
  action?: ActionDefinition;
}

export interface ColumnComponent extends BaseComponent {
  type: 'Column';
  gap?: string | number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
}

export interface RowComponent extends BaseComponent {
  type: 'Row';
  gap?: string | number;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  wrap?: boolean;
}

export interface CardComponent extends BaseComponent {
  type: 'Card';
  title?: string;
  subtitle?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export interface TextFieldComponent extends BaseComponent {
  type: 'TextField';
  label?: string;
  placeholder?: string;
  value?: string;
  dataPath?: string; // JSON Pointer path for data binding
  multiline?: boolean;
  rows?: number;
  disabled?: boolean | string;
  required?: boolean;
  inputType?: 'text' | 'email' | 'password' | 'tel' | 'number';
}

export interface CheckBoxComponent extends BaseComponent {
  type: 'CheckBox';
  label?: string;
  checked?: boolean | string;
  dataPath?: string;
  disabled?: boolean | string;
}

export interface ImageComponent extends BaseComponent {
  type: 'Image';
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

export interface DividerComponent extends BaseComponent {
  type: 'Divider';
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
}

export interface ListComponent extends BaseComponent {
  type: 'List';
  dataPath?: string; // Path to array data
  itemTemplateId?: string; // ID of template component to repeat
  emptyText?: string;
}

export interface TabsComponent extends BaseComponent {
  type: 'Tabs';
  tabs: TabDefinition[];
  activeTab?: string | number;
  dataPath?: string;
}

export interface TabDefinition {
  id: string;
  label: string;
  contentId?: string;
}

export interface IconComponent extends BaseComponent {
  type: 'Icon';
  name: string;
  size?: number;
  color?: string;
}

export interface VideoComponent extends BaseComponent {
  type: 'Video';
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface DateTimeInputComponent extends BaseComponent {
  type: 'DateTimeInput';
  label?: string;
  value?: string;
  dataPath?: string;
  mode?: 'date' | 'time' | 'datetime';
  min?: string;
  max?: string;
}

export interface SliderComponent extends BaseComponent {
  type: 'Slider';
  label?: string;
  value?: number;
  dataPath?: string;
  min?: number;
  max?: number;
  step?: number;
}

export type ComponentDefinition =
  | TextComponent
  | ButtonComponent
  | ColumnComponent
  | RowComponent
  | CardComponent
  | TextFieldComponent
  | CheckBoxComponent
  | ImageComponent
  | DividerComponent
  | ListComponent
  | TabsComponent
  | IconComponent
  | VideoComponent
  | DateTimeInputComponent
  | SliderComponent;

// ============================================
// Action Types
// ============================================

export interface ActionDefinition {
  type: 'sendAction';
  actionId: string;
  payload?: Record<string, unknown>;
}

export interface A2UIAction {
  actionId: string;
  surfaceId: string;
  componentId: string;
  payload?: Record<string, unknown>;
  dataModel?: Record<string, unknown>;
}

// ============================================
// Surface State
// ============================================

export interface SurfaceState {
  surfaceId: string;
  surfaceName?: string;
  rootId?: string;
  components: Map<string, ComponentDefinition>;
  dataModel: Record<string, unknown>;
}

// ============================================
// Renderer Props
// ============================================

export interface A2UIRendererProps {
  messages: A2UIMessage[];
  onAction?: (action: A2UIAction) => void;
}

export interface ComponentRendererProps {
  component: ComponentDefinition;
  components: Map<string, ComponentDefinition>;
  dataModel: Record<string, unknown>;
  onAction: (action: A2UIAction) => void;
  onDataChange: (path: string, value: unknown) => void;
  surfaceId: string;
}
