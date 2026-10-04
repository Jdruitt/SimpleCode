import type { ColorValue } from "react-native";
import Svg, { Path } from "react-native-svg";
import { withUniwind } from "uniwind";

const ThemedPath = withUniwind(Path);

/**
 * The "JD" brand mark, matching the desktop sidebar's T3Wordmark SVG
 * (apps/web Sidebar.tsx). Width derives from the viewBox aspect ratio.
 */
export function T3Wordmark(props: {
  readonly height: number;
  readonly color?: ColorValue;
  readonly colorClassName?: string;
}) {
  const aspectRatio = 89.5 / 56.96;
  return (
    <Svg
      accessibilityLabel="JD"
      height={props.height}
      width={props.height * aspectRatio}
      viewBox="18 37 89.5 56.96"
    >
      <ThemedPath
        d="M22.9 37H49V73.4C49 80.1 47.3 85.1 43.9 88.6C40.5 92.2 35.6 93.96 29.2 93.96C24.9 93.96 20.9 92.9 18 90.6L23.7 81.3C25.7 82.9 27.8 83.6 30.1 83.6C33.9 83.6 36 81.3 36 76.7V47.4H22.9V37ZM56 37H81C98 37 107.5 48 107.5 65C107.5 82 98 93 81 93H56V37ZM69 82.3H80.4C89 82.3 94.3 76 94.3 65C94.3 54 89 47.7 80.4 47.7H69V82.3Z"
        fillRule="evenodd"
        color={props.color}
        colorClassName={props.colorClassName}
        fill="currentColor"
      />
    </Svg>
  );
}
