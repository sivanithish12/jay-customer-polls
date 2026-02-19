// Poll status
export type PollStatus = "draft" | "active" | "closed";

// Poll type
export type PollType = "single_choice" | "multiple_choice";

// Poll
export interface Poll {
  id: string;
  slug: string;
  title: string;
  question: string; // Legacy field, kept for backward compatibility
  description: string | null;
  status: PollStatus;
  poll_type: PollType;
  show_results_after_vote: boolean;
  allow_multiple_selections: boolean;
  total_votes: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  expires_at: string | null;
  created_by: string | null;
}

// Poll Question (new - supports multiple questions per poll)
export interface PollQuestion {
  id: string;
  poll_id: string;
  question_text: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

// Poll Question with options
export interface PollQuestionWithOptions extends PollQuestion {
  options: PollOption[];
}

// Poll Option
export interface PollOption {
  id: string;
  poll_id: string;
  question_id: string | null; // Can be null for legacy polls
  option_text: string;
  display_order: number;
  vote_count: number;
  created_at: string;
}

// Poll Response (Vote)
export interface PollResponse {
  id: string;
  poll_id: string;
  question_id: string | null;
  option_id: string;
  session_id: string;
  ip_hash: string | null;
  device_type: string | null;
  voted_at: string;
}

// Poll with options (for display) - legacy support
export interface PollWithOptions extends Poll {
  options: PollOption[];
}

// Poll with questions (new - full support for multi-question polls)
export interface PollWithQuestions extends Poll {
  questions: PollQuestionWithOptions[];
}

// Question input for creating polls
export interface QuestionInput {
  question_text: string;
  description?: string;
  options: string[];
}

// Create poll input (updated for multi-question support)
export interface CreatePollInput {
  title: string;
  question: string; // First question text (for backward compatibility)
  description?: string;
  poll_type?: PollType;
  show_results_after_vote?: boolean;
  options: string[]; // Options for the first question (backward compatibility)
  questions?: QuestionInput[]; // Additional questions (optional)
}

// Update poll input
export interface UpdatePollInput {
  title?: string;
  question?: string;
  description?: string;
  status?: PollStatus;
  show_results_after_vote?: boolean;
  expires_at?: string | null;
}

// Vote input (updated for multi-question support)
export interface VoteInput {
  poll_id: string;
  question_id: string;
  option_id: string;
  session_id: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
