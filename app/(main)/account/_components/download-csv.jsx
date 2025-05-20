"use client";

import { Button } from "@/components/ui/button";

export default function DownloadCSVButton() {
    const handleDownload = () => {
        window.open("/api/export", "_blank");
    };

    return (
        <Button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-sm font-semibold shadow"
        >
            Export Transactions
        </Button>
    );
}