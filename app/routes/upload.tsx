import Navbar from "~/components/Navbar";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {cleanJsonString, generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import ClientOnly from "~/components/ClientOnly";
// @ts-ignore
import { useState, type FormEvent, lazy, Suspense } from "react";

const FileUploader = lazy(() => import("~/components/FileUploader"));

const UploadContent = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState(null) as [File | null, any];

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        try {
            setIsProcessing(true);

            setStatusText('Uploading the file...');
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile || !uploadedFile.path) {
                return setStatusText('Error: Failed to upload file');
            }

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                return setStatusText('Error: Failed to convert PDF to image');
            }

            setStatusText('Uploading the image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage || !uploadedImage.path) {
                return setStatusText('Error: Failed to upload image');
            }

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, 
                jobTitle, 
                jobDescription,
                feedback: '',
            }

            if (!data.resumePath || data.resumePath === '.' || !data.imagePath || data.imagePath === '.') {
                return setStatusText('Error: Invalid file paths generated');
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing...');

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );
            if (!feedback) {
                return setStatusText('Error: Failed to analyze resume');
            }

            const feedbackText = feedback?.message && typeof feedback.message === 'object' && 'content' in feedback.message
                ? (typeof (feedback.message as any).content === 'string'
                    ? (feedback.message as any).content
                    : (feedback.message as any).content[0]?.text)
                : '';

            try {
                data.feedback = JSON.parse(cleanJsonString(feedbackText));
            } catch (error) {
                console.error('Error parsing feedback:', error);
                console.log('Original feedback text:', feedbackText);
                return setStatusText('Error: Failed to parse AI feedback');
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            console.log(data);
            navigate(`/resume/${uuid}`);
        } catch (error) {
            console.error('Error during analysis:', error);
            setStatusText('Error: An unexpected error occurred during analysis');
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <Suspense fallback={<div>Loading uploader...</div>}>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </Suspense>
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default function Upload() {
  return (
    <ClientOnly fallback={
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Smart feedback for your dream job</h1>
            <h2>Loading...</h2>
          </div>
        </section>
      </main>
    }>
      <UploadContent />
    </ClientOnly>
  );
}
