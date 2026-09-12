import styles from './constructor-placeholder.module.css';

type TConstructorPlaceholderProps = {
  isActive?: boolean;
  isHovered?: boolean;
  isTall?: boolean;
  text: string;
  type?: 'bottom' | 'top';
};

export const ConstructorPlaceholder = ({
  isActive = false,
  isHovered = false,
  isTall = false,
  text,
  type,
}: TConstructorPlaceholderProps): React.JSX.Element => {
  const className = [
    styles.placeholder,
    type === 'top' ? styles.placeholderTop : '',
    type === 'bottom' ? styles.placeholderBottom : '',
    isActive ? styles.placeholderActive : '',
    isHovered ? styles.placeholderHovered : '',
    isTall ? styles.placeholderTall : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <span className="text text_type_main-default">{text}</span>
    </div>
  );
};
