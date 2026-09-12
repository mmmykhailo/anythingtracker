import * as React from "react";
import { Scroll, Sheet } from "@silk-hq/components";

import { useKeyboardInset } from "~/lib/hooks/useKeyboardInset";
import { cn } from "~/lib/utils";

type DrawerDirection = "bottom" | "right";

const DirectionContext = React.createContext<DrawerDirection>("bottom");

type DrawerProps = Omit<
  React.ComponentProps<typeof Sheet.Root>,
  "license" | "presented" | "onPresentedChange"
> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  direction?: DrawerDirection;
};

function Drawer({
  open,
  onOpenChange,
  direction = "bottom",
  className,
  children,
  ...props
}: DrawerProps) {
  return (
    <DirectionContext.Provider value={direction}>
      <Sheet.Root
        data-slot="drawer"
        license="non-commercial"
        presented={open}
        onPresentedChange={onOpenChange}
        className={cn("contents", className)}
        {...props}
      >
        {children}
      </Sheet.Root>
    </DirectionContext.Provider>
  );
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof Sheet.Trigger>) {
  return <Sheet.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof Sheet.Trigger>) {
  return <Sheet.Trigger data-slot="drawer-close" action="dismiss" {...props} />;
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Sheet.Content>) {
  const direction = React.useContext(DirectionContext);
  useKeyboardInset();

  return (
    <Sheet.Portal>
      <Sheet.View
        data-slot="drawer-view"
        className="z-50 h-[var(--silk-100-lvh-dvh-pct)]"
        contentPlacement={direction}
        swipeOvershoot={direction === "bottom"}
        nativeEdgeSwipePrevention
        onPresentAutoFocus={{ focus: false }}
      >
        <Sheet.Backdrop
          data-slot="drawer-overlay"
          themeColorDimming="auto"
          className="bg-black"
        />
        <Sheet.Content
          data-slot="drawer-content"
          className={cn(
            "group/drawer-content box-border flex flex-col bg-background outline-none",
            // The sheet grows by exactly what the on-screen keyboard covers, so
            // the part of it the user can actually see stays 75dvh tall.
            direction === "bottom" &&
              "h-[min(calc(75dvh+var(--keyboard-inset,0px)),100dvh)] w-full rounded-t-lg border-t border-border pb-[max(env(safe-area-inset-bottom),var(--keyboard-inset,0px))]",
            direction === "right" &&
              "h-full w-3/4 border-l border-border sm:max-w-sm",
            className
          )}
          {...props}
        >
          {direction === "bottom" && (
            <Sheet.Handle
              action="dismiss"
              className="mx-auto mt-4 h-2 w-[100px] shrink-0 rounded-full border-0 bg-muted"
            />
          )}
          {children}
        </Sheet.Content>
      </Sheet.View>
    </Sheet.Portal>
  );
}

/**
 * Scrollable region for the drawer body. Silk needs its own scroll container so
 * that scrolling and swipe-to-dismiss hand over to each other correctly.
 */
function DrawerScroll({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Scroll.View>) {
  return (
    <Scroll.Root className={cn("min-h-0 flex-1", className)}>
      <Scroll.View data-slot="drawer-scroll" className="h-full" {...props}>
        <Scroll.Content>{children}</Scroll.Content>
      </Scroll.View>
    </Scroll.Root>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof Sheet.Title>) {
  return (
    <Sheet.Title
      data-slot="drawer-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof Sheet.Description>) {
  return (
    <Sheet.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerScroll,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
