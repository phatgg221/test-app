// import { useState } from "react";
// import { Send, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// import { useToast } from "@/hooks/use-toast";
// import { formatDistanceToNow } from "date-fns";

// interface CommentSectionProps {
//     photoId: string;
//     comments: Comment[];
//     onCommentAdded: () => void;
// }

// const CommentSection = ({ photoId, comments, onCommentAdded }: CommentSectionProps) => {
//     const [text, setText] = useState("");
//     const [submitting, setSubmitting] = useState(false);
//     const { toast } = useToast();

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!text.trim()) return;

//         setSubmitting(true);
//         try {
//             await addComment(photoId, text);
//             setText("");
//             onCommentAdded();
//         } catch {
//             toast({ title: "Error", description: "Couldn't post comment.", variant: "destructive" });
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <div className="mt-4 pt-4 border-t">
//             {comments.length > 0 && (
//                 <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
//                     {comments.map((c) => (
//                         <div key={c.id} className="flex gap-2 text-sm">
//                             <div className="w-6 h-6 rounded-full bg-accent flex-shrink-0 flex items-center justify-center text-xs font-medium text-accent-foreground">
//                                 ?
//                             </div>
//                             <div className="flex-1 min-w-0">
//                                 <p className="text-foreground break-words">{c.content}</p>
//                                 <p className="text-xs text-muted-foreground mt-0.5">
//                                     {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
//                                 </p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             <form onSubmit={handleSubmit} className="flex gap-2">
//                 <Input
//                     value={text}
//                     onChange={(e) => setText(e.target.value)}
//                     placeholder="Add a comment…"
//                     maxLength={500}
//                     className="flex-1 text-sm"
//                 />
//                 <Button type="submit" size="icon" variant="ghost" disabled={!text.trim() || submitting}>
//                     {submitting ? (
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                     ) : (
//                         <Send className="w-4 h-4" />
//                     )}
//                 </Button>
//             </form>
//         </div>
//     );
// };

// export default CommentSection;
