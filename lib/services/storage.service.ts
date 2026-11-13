import db from "../db";

export interface SaveDocumentMetadataParams {
  studentId: string;
  documentType: string;
  title: string;
  fileUrl: string;
  fileSize?: number;
}

/**
 * Shared Document Upload & Storage Service
 */
export async function saveStudentDocument(params: SaveDocumentMetadataParams) {
  return await db.studentDocument.create({
    data: {
      studentId: params.studentId,
      documentType: params.documentType,
      title: params.title,
      fileUrl: params.fileUrl,
      fileSize: params.fileSize,
    },
  });
}

export async function getStudentDocuments(studentId: string) {
  return await db.studentDocument.findMany({
    where: { studentId },
    orderBy: { uploadedAt: "desc" },
  });
}

