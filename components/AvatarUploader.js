import { useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export default function AvatarUploader({ user, profile, onChange }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(profile.avatar_url || null);

    async function handleUpload(e) {
        // Remember, these supabase files are viweable by the PUBLIC!
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = `${user.id}-${uuidv4()}`;
        setUploading(true);

        // Upload the file, setting metadata indicating the owner
        const { error } = await supabase
            .storage
            .from("pictures")
            .upload(fileName, file, { upsert: true, metadata: { owner: user.id } });

        
        if (!error) {
        
            // Get the URL of the file that was uploaded
            const { data } = supabase.storage
                .from("pictures")
                .getPublicUrl(fileName);

            if (data?.publicUrl) {
                // Update the profiles table with the new avatar_url
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({avatar_url: data.publicUrl})
                    .eq('id', user.id)
                    
                if (!updateError) {
                    setPreview(data.publicUrl);
                    onChange?.(data.publicUrl); // The onChange handler in the parent component is responsible for calling setProfile() 
                } else {
                    console.error(`Avatar uploaded, but failed to write profile with correct URL: ${updateError.message}`);
                }
            } else {
                console.error("Failed to get public URL");
            }
            
        } else {
            console.error(`An error occurred while uploading avatar: ${error.message}`);
        }

        setUploading(false);
    }

    return (
        <label
            className="avatar-uploader-label position-relative cursor-pointer d-inline-block mb-3"
            style={{ width: 96, height: 96 }}
        >
            {preview ? (
                <Image
                    src={preview}
                    width={96}
                    height={96}
                    alt="avatar preview"
                    className="object-cover"
                    style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        border: "2px solid black",
                        display: "block"
                    }}
                />
            ) : (
                <div
                    className="d-flex text-light flex-column justify-content-center align-items-center bg-gray-200"
                    style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        border: "2px solid black"
                    }}
                >
                    No avatar
                </div>
            )}

            {/* Invisible input (UNDER the overlay) */}
            <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 1         // must be lower than overlay
                }}
            />

            {/* Overlay (ABOVE input, but pointer-events: none so input still works) */}
            <div
                className="avatar-overlay d-flex justify-content-center align-items-center"
                style={{
                    position: "absolute",
                    width: "2rem",
                    height: "2rem",
                    right: 0,
                    bottom: 0,
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: 2,        // must be higher than input
                    transition: "background 0.2s"
                }}
            >
                <i className="bi bi-pencil" style={{ fontSize: 20, color: "white" }} />
            </div>
        </label>
    );

}

