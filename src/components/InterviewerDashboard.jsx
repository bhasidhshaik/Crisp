import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpDown } from 'lucide-react';
import { clearAllCandidates, setCandidateStatus } from '../features/candidatesSlice.js';

const scoreColorClass = (score) => {
  if (score == null) return 'bg-white';
  if (score >= 75) return ' border-emerald-400 bg-emerald-50';
  if (score >= 50) return ' border-yellow-400 bg-yellow-50';
  return ' border-red-400 bg-red-50';
};

const statusLabel = (s) => {
  if (!s || s === 'normal') return 'Normal';
  return s[0].toUpperCase() + s.slice(1);
};

const SmallBox = ({ title, statusKey, items, onDrop, onClick, isDragOver, setDragOverTarget }) => {
  return (
    <div
      onClick={() => onClick(statusKey)}
      onDragEnter={(e) => { e.preventDefault(); setDragOverTarget(statusKey); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverTarget(statusKey); }}
      onDragLeave={() => setDragOverTarget(null)}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e, statusKey); setDragOverTarget(null); }}
      className={`border rounded-md p-3 cursor-pointer transition-all flex flex-col ${title === 'Selected' ? 'border-green-500' : 'border-red-500'}
 ${isDragOver ? 'ring-2 ring-blue-300' : '' }`}
      style={{ height: 190, minWidth: 220, overflow: 'hidden' }}
    >
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold">{title}</h4>
        <span className="text-sm text-slate-500">{items.length}</span>
      </div>

      <div
        className="flex-1 overflow-hidden"
        onDragEnter={(e) => { e.preventDefault(); setDragOverTarget(statusKey); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverTarget(statusKey); }}
        onDragLeave={() => setDragOverTarget(null)}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(e, statusKey); setDragOverTarget(null); }}
      >
        <ScrollArea className="h-full">
          <ul className="space-y-2">
            {items.slice(0, 6).map((c) => (
              <li
                key={c.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', c.id);
                  e.dataTransfer.setData('text/candidate-id', c.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className="text-sm p-2 rounded-md hover:bg-slate-100"
                title={`${c.candidate.name} — ${c.score ?? 'N/A'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate">{c.candidate.name}</span>
                  <span className="text-xs text-slate-500 ml-2">{c.score ?? '—'}</span>
                </div>
              </li>
            ))}
            {items.length === 0 && <li className="text-sm text-slate-400">No candidates</li>}
          </ul>
        </ScrollArea>
      </div>
    </div>
  );
};

const InterviewerDashboard = () => {
  const dispatch = useDispatch();
  const { list: candidates } = useSelector((state) => state.candidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // desc = highest first
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null); // 'main' | 'selected' | 'rejected' | null
  const [expandedBox, setExpandedBox] = useState(null); // 'selected' | 'rejected' | null

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to delete all interview data? This cannot be undone.")) {
      dispatch(clearAllCandidates());
    }
  };

  // Only candidates with completed interviews
  const normalized = (candidates || []).map(c => ({
    ...c,
    status: c.status ?? 'normal'
  }));

  // Filter + sort main table candidates (completed only)
  const filteredAndSortedCandidates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = normalized.filter(c => c.status !== 'pending' && c.status !== undefined && c.candidate.name.toLowerCase().includes(term));
    return [...filtered].sort((a, b) => {
      const aScore = a.score ?? -1;
      const bScore = b.score ?? -1;
      return sortOrder === 'asc' ? aScore - bScore : bScore - aScore;
    });
  }, [normalized, searchTerm, sortOrder]);

  const selectedList = normalized.filter(c => c.status === 'selected');
  const rejectedList = normalized.filter(c => c.status === 'rejected');

  const handleRowClick = (candidate) => {
    if (draggingId) return;
    setSelectedCandidate(candidate);
  };

  const toggleSortOrder = () => setSortOrder(s => (s === 'asc' ? 'desc' : 'asc'));

  const handleMainDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget('main');
  };
  const handleMainDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/candidate-id');
    if (!id) return;
    dispatch(setCandidateStatus({ id, status: 'normal' }));
    setDragOverTarget(null);
  };

  const handleBoxDrop = (e, statusKey) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/candidate-id');
    if (!id) return;
    dispatch(setCandidateStatus({ id, status: statusKey }));
    setDragOverTarget(null);
  };

  const handleExpandBox = (statusKey) => setExpandedBox(prev => (prev === statusKey ? null : statusKey));
  const showMainTable = !expandedBox;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">Candidate Leaderboard</h2>
        <Button variant="destructive" onClick={handleResetData}>Reset All Data</Button>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <Input
          placeholder="Search by candidate name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={toggleSortOrder} className="flex items-center">
            Score <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* MAIN TABLE */}
        <div
          className={`flex-1 border rounded-lg bg-white shadow-sm p-0 overflow-hidden ${dragOverTarget === 'main' ? 'ring-2 ring-blue-300' : ''}`}
          onDragEnter={handleMainDragOver}
          onDragOver={handleMainDragOver}
          onDragLeave={() => setDragOverTarget(null)}
          onDrop={handleMainDrop}
        >
          {showMainTable ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Box</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCandidates.length > 0 ? (
                  filteredAndSortedCandidates.map(c => (
                    <TableRow
                      key={c.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', c.id);
                        e.dataTransfer.setData('text/candidate-id', c.id);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingId(c.id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onClick={() => handleRowClick(c)}
                      className={`cursor-pointer hover:bg-slate-50 ${scoreColorClass(c.score)}`}
                    >
                      <TableCell>{c.candidate.name}</TableCell>
                      <TableCell>{c.candidate.email}</TableCell>
                      <TableCell className="text-right font-bold">{c.score ?? '—'}/100</TableCell>
                      <TableCell>
                        {c.status === 'selected' ? 'Selected' : c.status === 'rejected' ? 'Rejected' : 'Normal'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      No candidates in the main list (try toggling search or move some back to 'Normal').
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : null}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 flex flex-col gap-4">
          <SmallBox
            title="Selected"
            statusKey="selected"
            items={selectedList}
            onDrop={handleBoxDrop}
            onClick={handleExpandBox}
            isDragOver={dragOverTarget === 'selected'}
            setDragOverTarget={setDragOverTarget}
          />
          <SmallBox
            title="Rejected"
            statusKey="rejected"
            items={rejectedList}
            onDrop={handleBoxDrop}
            onClick={handleExpandBox}
            isDragOver={dragOverTarget === 'rejected'}
            setDragOverTarget={setDragOverTarget}
          />
        </div>
      </div>

      {/* Candidate details dialog */}
      {selectedCandidate && (
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-2xl mt-5">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedCandidate.candidate.name}</DialogTitle>
              <DialogTitle className="text-sm font-normal">{selectedCandidate.candidate.email}</DialogTitle>
              <DialogTitle className="text-sm font-normal mt-[-7px]">{selectedCandidate.candidate.phone}</DialogTitle>
              <DialogDescription>
                Final Score: <span className="font-bold text-lg">{selectedCandidate.score ?? '—'}/100</span>
              </DialogDescription>
            </DialogHeader>

            <div>
              <h3 className="font-semibold mb-2">AI Summary:</h3>
              <p className="text-sm p-3 bg-slate-100 rounded-md">{selectedCandidate.summary}</p>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Full Transcript:</h3>
              <ScrollArea className="h-60 border rounded-md p-3">
                {(selectedCandidate.questions || []).map((q, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-bold text-slate-800">{index + 1}. {q.question} <span className="text-xs font-normal text-slate-500">({q.difficulty})</span></p>
                    <p className="pl-4 mt-1 text-slate-600 italic">{selectedCandidate.answers?.[index] || "No answer provided."}</p>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default InterviewerDashboard;
