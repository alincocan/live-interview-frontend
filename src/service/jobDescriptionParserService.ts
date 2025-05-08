import axios from 'axios';

export interface JobDescriptionParseResponse {
    jobName?: string;
    tags?: string[];
    success?: boolean;
    message?: string;
}

export class JobDescriptionParserService {
    private static instance: JobDescriptionParserService;
    private baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8081';

    private constructor() { }

    public static getInstance(): JobDescriptionParserService {
        if (!JobDescriptionParserService.instance) {
            JobDescriptionParserService.instance = new JobDescriptionParserService();
        }
        return JobDescriptionParserService.instance;
    }

    public async processJobDescriptionFile(file: File): Promise<JobDescriptionParseResponse> {
        try {
            const fileContent = await this.parseFileContent(file);
            return await this.sendJobDescription(fileContent);
        } catch (error) {
            console.error('Error processing job description file:', error);
            return {
                success: false,
                message: 'Failed to process the job description file. Please try again.'
            };
        }
    }

    public async processJobDescriptionText(jobDescription: string): Promise<JobDescriptionParseResponse> {
        try {
            return await this.sendJobDescription(jobDescription);
        } catch (error) {
            console.error('Error processing job description text:', error);
            return {
                success: false,
                message: 'Failed to process the job description text. Please try again.'
            };
        }
    }

    private async sendJobDescription(jobDescription: string): Promise<JobDescriptionParseResponse> {
        try {
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            const response = await axios.post<JobDescriptionParseResponse>(
                `${this.baseUrl}/jobs/parse`,
                { prompt: jobDescription },
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                }
            );

            return {
                ...response.data,
                success: true
            };
        } catch (error: unknown) {
            console.error('Job description parse error:', error);

            // Handle different types of errors
            if (axios.isAxiosError(error) && error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                return {
                    success: false,
                    message: error.response.data?.message || 'The job description uploaded could not be parsed. Please try again or skip to manual configuration.'
                };
            } else if (axios.isAxiosError(error) && error.request) {
                // The request was made but no response was received
                return {
                    success: false,
                    message: 'No response from server. Please try again later.'
                };
            } else {
                // Something happened in setting up the request that triggered an Error
                return {
                    success: false,
                    message: 'An error occurred during job description parsing mechanism. Please try again.'
                };
            }
        }
    }

    private async parseFileContent(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
                const arrayBuffer = event.target?.result;
                if (!arrayBuffer) {
                    return reject('Failed to read file content.');
                }

                try {
                    if (file.type === 'application/pdf') {
                        const pdfjsLib = await import('pdfjs-dist');
                        pdfjsLib.GlobalWorkerOptions.workerSrc =
                            '../../node_modules/pdfjs-dist/build/pdf.worker.mjs';
                        
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        let text = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            text += content.items.map((item: any) => item.str).join(' ');
                        }
                        resolve(text);
                    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                        const mammoth = await import('mammoth');
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        resolve(result.value);
                    } else {
                        reject('Unsupported file type. Please upload a PDF or DOCX file.');
                    }
                } catch (error) {
                    reject(`Error parsing file content: ${error}`);
                }
            };

            reader.onerror = () => {
                reject('Error reading file.');
            };

            reader.readAsArrayBuffer(file);
        });
    }
}