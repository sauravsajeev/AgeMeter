import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

function Number({ mv, number, height }) {
  let y = useTransform(mv, latest => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  const style = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return <motion.span style={{ ...style, y }}>{number}</motion.span>;
}

function Digit({ place, value, height, digitStyle }) {
  // Support fractional place values (0.1, 0.01, etc.)
  let valueRoundedToPlace =
    place >= 1
      ? Math.floor(value / place) % 10
      : Math.floor((value / place) % 10);

  let animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  const defaultStyle = {
    height,
    position: 'relative',
    width: '1ch',
    fontVariantNumeric: 'tabular-nums'
  };

  return (
    <div style={{ ...defaultStyle, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </div>
  );
}

export default function Counter({
  value,
  fontSize = 100,
  padding = 0,
  places = [10, 1, 0.1, 0.01],
  gap = 8,
  borderRadius = 4,
  horizontalPadding = 8,
  textColor = 'white',
  fontWeight = 'bold',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = 'transparent',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle
}) {
  const height = fontSize + padding;

  const defaultContainerStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  const defaultCounterStyle = {
    fontSize,
    display: 'flex',
    gap: gap,
    overflow: 'hidden',
    borderRadius: borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    lineHeight: 1,
    color: textColor,
    fontWeight: fontWeight
  };

  const gradientContainerStyle = {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  };

  const defaultTopGradientStyle = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`
  };

  const defaultBottomGradientStyle = {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`
  };

  // Split integer and decimal places
  const intPlaces = places.filter(p => p >= 1);
  const decPlaces = places.filter(p => p < 1);

  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultCounterStyle, ...counterStyle }}>
        {/* Integer digits */}
        {intPlaces.map(place => (
          <Digit
            key={place}
            place={place}
            value={value}
            height={height}
            digitStyle={digitStyle}
          />
        ))}

        {/* Decimal point if needed */}
        {decPlaces.length > 0 && (
          <span style={{ lineHeight: 1, fontWeight, color: textColor }}>.</span>
        )}

        {/* Decimal digits */}
        {decPlaces.map(place => (
          <Digit
            key={place}
            place={place}
            value={value}
            height={height}
            digitStyle={digitStyle}
          />
        ))}
      </div>

      {/* Top + bottom fade gradients */}
      <div style={gradientContainerStyle}>
        <div style={topGradientStyle ? topGradientStyle : defaultTopGradientStyle} />
        <div style={bottomGradientStyle ? bottomGradientStyle : defaultBottomGradientStyle} />
      </div>
    </div>
  );
}
