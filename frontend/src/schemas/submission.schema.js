import { z } from "zod";

const SubmissionSchema = z.object({
    file: z
        .instanceof(FileList)
        .refine((files) => files.length === 1, {
            error: "Please select a single file",
        })
        .transform((files) => files[0]),
    language: z.enum(["python"], {
        error: "Please select a valid language"
    })
});

export default SubmissionSchema;
