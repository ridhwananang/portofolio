import "@fontsource/bodoni-moda/600.css";
import "@fontsource/bodoni-moda/700.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "../../../css/aan.css";

import { Head } from "@inertiajs/react";
import { ExperienceView } from "@/aan/components/ExperienceView";

export default function AanPage() {
    return (
        <div className="aan-scope min-h-screen bg-[#07070a] text-[#f5efe6] selection:bg-[#d4af37]/30 selection:text-[#f5efe6]">
            <Head title="Aan" />
            <ExperienceView />
        </div>
    );
}