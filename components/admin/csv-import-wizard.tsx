'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, Download } from 'lucide-react';
import { parseAndValidateCSV, importResultsFromCSV } from '@/actions/admin/results-import.actions';

interface CSVImportWizardProps {
  runId: number;
  runName: string;
}

type Step = 'upload' | 'preview' | 'complete';

export function CSVImportWizard({ runId, runName }: CSVImportWizardProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        setCsvContent(content);

        // Parse and validate
        const result = await parseAndValidateCSV(content, runId);

        if (result.success && result.data) {
          setValidationResult(result.data);
          setStep('preview');
        } else {
          setError(result.error || 'Failed to parse CSV');
        }
        setLoading(false);
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!csvContent) return;

    setLoading(true);
    setError(null);

    try {
      const result = await importResultsFromCSV(csvContent, runId);

      if (result.success && result.data) {
        setImportResult(result.data);
        setStep('complete');
      } else {
        setError(result.error || 'Failed to import results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import results');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setCsvContent('');
    setValidationResult(null);
    setImportResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Import Results</h2>
        <p className="text-muted-foreground">
          Import race results for: <strong>{runName}</strong>
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-4">
        <StepIndicator number={1} label="Upload" active={step === 'upload'} completed={step !== 'upload'} />
        <div className="flex-1 h-px bg-border" />
        <StepIndicator number={2} label="Preview" active={step === 'preview'} completed={step === 'complete'} />
        <div className="flex-1 h-px bg-border" />
        <StepIndicator number={3} label="Complete" active={step === 'complete'} completed={false} />
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file containing race results. The file should include columns for registration number, bib
              number, name, finish time, and status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                ) : (
                  'Click to select CSV file or drag and drop'
                )}
              </label>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-2">Expected CSV format:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                registrationNumber,bibNumber,firstName,lastName,finishTime,overallPlace,categoryPlace,status
              </code>
            </div>

            <Button onClick={handleUpload} disabled={!file || loading} className="w-full">
              {loading ? 'Processing...' : 'Upload and Validate'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview and Validate */}
      {step === 'preview' && validationResult && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Rows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{validationResult.totalRows}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Valid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{validationResult.validRows}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{validationResult.errorRows}</div>
              </CardContent>
            </Card>
          </div>

          {/* Errors list */}
          {validationResult.errorRows > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Validation Errors
                </CardTitle>
                <CardDescription>The following rows have errors and will be skipped:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {validationResult.errors.map((err: any, idx: number) => (
                    <Alert key={idx} variant="destructive">
                      <AlertDescription className="text-sm">
                        <strong>
                          {err.row.firstName} {err.row.lastName}
                        </strong>
                        : {err.error}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valid results preview */}
          {validationResult.validRows > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Valid Results Preview</CardTitle>
                <CardDescription>
                  Showing first 10 valid results. {validationResult.validRows} total will be imported.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Reg #</TableHead>
                      <TableHead>Bib #</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Place</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.valid.slice(0, 10).map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {item.row.firstName} {item.row.lastName}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{item.row.registrationNumber || '-'}</TableCell>
                        <TableCell>{item.row.bibNumber || '-'}</TableCell>
                        <TableCell>{item.row.finishTime || '-'}</TableCell>
                        <TableCell>{item.row.overallPlace || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={item.row.status === 'finished' ? 'default' : 'secondary'}>
                            {item.row.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={handleReset} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={validationResult.validRows === 0 || loading}
              className="flex-1"
            >
              {loading ? 'Importing...' : `Import ${validationResult.validRows} Results`}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 'complete' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Import Complete
            </CardTitle>
            <CardDescription>Results have been successfully imported</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Imported</p>
                <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Skipped (already exist)</p>
                <p className="text-2xl font-bold text-gray-600">{importResult.skipped}</p>
              </div>
            </div>

            {importResult.importErrors && importResult.importErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Import Errors</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 mt-2">
                    {importResult.importErrors.map((err: string, idx: number) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Import More Results
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          completed
            ? 'bg-primary border-primary text-primary-foreground'
            : active
            ? 'border-primary text-primary'
            : 'border-border text-muted-foreground'
        }`}
      >
        {completed ? <CheckCircle2 className="h-4 w-4" /> : number}
      </div>
      <span className={`text-sm font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
    </div>
  );
}
