import ClientOnly from "./ClientOnly";
import PuterInitializer from "./PuterInitializer";

export default function PuterProvider() {
  return (
    <ClientOnly>
      <PuterInitializer />
    </ClientOnly>
  );
}
