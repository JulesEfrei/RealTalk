"use client";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Toggle } from "@radix-ui/react-toggle";
import { useTheme } from "next-themes";

export default function ToggleTheme() {
  const { theme, setTheme } = useTheme();

  return (
    <Toggle
      pressed={theme === "dark"}
      onPressedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      )}
    </Toggle>
  );
}
