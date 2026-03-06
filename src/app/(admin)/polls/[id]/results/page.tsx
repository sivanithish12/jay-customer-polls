"use client";

import { useEffect, useState, use, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Activity,
  Award,
  Target,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
} from "@/components/ui/chart";
import type { Poll, PollQuestion, PollOption } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Colors for charts - JustMoveIn brand palette
const CHART_COLORS = [
  "#FB654D",    // brand-coral
  "#6144DD",    // brand-indigo
  "#009966",    // brand-bright-emerald
  "#155DFC",    // brand-bright-blue
  "#EAB308",    // brand-yellow-500
  "#F4A462",    // brand-orange-accent
  "#9333EA",    // brand-purple
  "#A499A8",    // brand-grurple
];

interface QuestionWithOptions extends PollQuestion {
  options: PollOption[];
}

export default function ResultsPage({ params }: PageProps) {
  const { id } = use(params);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      // Fetch poll
      const { data: pollData } = await supabase
        .from("polls")
        .select("*")
        .eq("id", id)
        .single();

      // Fetch questions with options
      const { data: questionsData } = await supabase
        .from("poll_questions")
        .select("*")
        .eq("poll_id", id)
        .order("display_order");

      if (questionsData) {
        const questionsWithOptions = await Promise.all(
          questionsData.map(async (question) => {
            const { data: optionsData } = await supabase
              .from("poll_options")
              .select("*")
              .eq("question_id", question.id)
              .order("display_order");
            return { ...question, options: optionsData || [] };
          })
        );
        setQuestions(questionsWithOptions);
      }

      if (pollData) setPoll(pollData);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`results-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "poll_options",
          filter: `poll_id=eq.${id}`,
        },
        (payload) => {
          setQuestions((prev) =>
            prev.map((question) => ({
              ...question,
              options: question.options.map((opt) =>
                opt.id === payload.new.id
                  ? { ...opt, vote_count: payload.new.vote_count }
                  : opt
              ),
            }))
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "polls",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setPoll((prev) =>
            prev ? { ...prev, total_votes: payload.new.total_votes } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!poll || questions.length === 0) return null;

    const totalVotes = poll.total_votes || 0;
    const totalOptions = questions.reduce((acc, q) => acc + q.options.length, 0);

    // Find the leading option across all questions
    let leadingOption = { text: "", votes: 0, questionText: "" };
    questions.forEach((q) => {
      q.options.forEach((opt) => {
        if (opt.vote_count > leadingOption.votes) {
          leadingOption = {
            text: opt.option_text,
            votes: opt.vote_count,
            questionText: q.question_text,
          };
        }
      });
    });

    // Calculate engagement rate (assuming it's based on votes vs options ratio)
    const avgVotesPerOption = totalOptions > 0 ? totalVotes / totalOptions : 0;

    return {
      totalVotes,
      totalQuestions: questions.length,
      totalOptions,
      leadingOption,
      avgVotesPerOption: Math.round(avgVotesPerOption * 10) / 10,
    };
  }, [poll, questions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-brand-mid-grey animate-spin" />
      </div>
    );
  }

  if (!poll || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-mid-grey">Poll not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/polls/${id}`}
          className="inline-flex items-center gap-2 text-brand-mid-grey hover:text-brand-dark-grey mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to poll
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-black">
              Poll Analytics Dashboard
            </h1>
            <p className="text-brand-dark-grey mt-1">{poll.title}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-light-emerald text-brand-bright-emerald rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-brand-bright-emerald rounded-full animate-pulse" />
            Live Updates
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-brand-light-orange to-brand-light-mauve border-brand-light-grey/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-indigo to-brand-coral rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-brand-mid-grey font-medium">Total Responses</p>
                  <motion.p
                    key={analytics.totalVotes}
                    initial={{ scale: 1.2, color: "#f97316" }}
                    animate={{ scale: 1, color: "#1e293b" }}
                    className="text-3xl font-bold"
                  >
                    {analytics.totalVotes}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-brand-light-blue to-brand-light-purple border-brand-light-grey/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-bright-blue to-brand-indigo rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-brand-mid-grey font-medium">Questions</p>
                  <p className="text-3xl font-bold text-brand-black">
                    {analytics.totalQuestions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-brand-light-emerald to-brand-mid-emerald/30 border-brand-light-grey/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-bright-emerald to-[#00B27A] rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-brand-mid-grey font-medium">Avg per Option</p>
                  <p className="text-3xl font-bold text-brand-black">
                    {analytics.avgVotesPerOption}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-brand-light-yellow to-brand-light-orange border-brand-light-grey/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#EAB308] to-brand-orange-accent rounded-2xl flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-brand-mid-grey font-medium">Leading Choice</p>
                  <p className="text-lg font-bold text-brand-black truncate max-w-[120px]" title={analytics.leadingOption.text}>
                    {analytics.leadingOption.text || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per-Question Analytics */}
        {questions.map((question, qIndex) => {
          const questionTotal = question.options.reduce(
            (acc, opt) => acc + opt.vote_count,
            0
          );

          const pieData = question.options.map((opt, idx) => ({
            name: opt.option_text,
            value: opt.vote_count,
            fill: CHART_COLORS[idx % CHART_COLORS.length],
          }));

          const barData = question.options.map((opt, idx) => ({
            name: opt.option_text.length > 20
              ? opt.option_text.substring(0, 20) + "..."
              : opt.option_text,
            fullName: opt.option_text,
            votes: opt.vote_count,
            percentage: questionTotal > 0
              ? Math.round((opt.vote_count / questionTotal) * 100)
              : 0,
            fill: CHART_COLORS[idx % CHART_COLORS.length],
          }));

          const chartConfig: ChartConfig = question.options.reduce(
            (acc, opt, idx) => ({
              ...acc,
              [opt.option_text]: {
                label: opt.option_text,
                color: CHART_COLORS[idx % CHART_COLORS.length],
              },
            }),
            {} as ChartConfig
          );

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (qIndex + 5) }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-brand-alabaster to-brand-light-mauve border-b">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-brand-indigo to-brand-coral rounded-xl text-white font-bold shadow">
                      Q{qIndex + 1}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{question.question_text}</CardTitle>
                      <CardDescription className="mt-1">
                        {questionTotal} responses • {question.options.length} options
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Pie Chart */}
                  <div className="h-[250px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                          }
                          labelLine={false}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white border border-brand-light-grey rounded-lg shadow-lg p-3">
                                  <p className="font-medium text-brand-black">{data.name}</p>
                                  <p className="text-sm text-brand-mid-grey">
                                    {data.value} votes ({questionTotal > 0 ? Math.round((data.value / questionTotal) * 100) : 0}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bar breakdown */}
                  <div className="space-y-3">
                    {[...question.options]
                      .sort((a, b) => b.vote_count - a.vote_count)
                      .map((option, oIndex) => {
                        const percentage =
                          questionTotal > 0
                            ? Math.round((option.vote_count / questionTotal) * 100)
                            : 0;

                        return (
                          <div key={option.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-brand-dark-grey truncate max-w-[200px]">
                                {option.option_text}
                              </span>
                              <div className="flex items-center gap-2 text-brand-mid-grey">
                                <motion.span
                                  key={option.vote_count}
                                  initial={{ scale: 1.1 }}
                                  animate={{ scale: 1 }}
                                >
                                  {option.vote_count} votes
                                </motion.span>
                                <motion.span
                                  key={`${option.id}-${percentage}`}
                                  initial={{ scale: 1.1, color: "#f97316" }}
                                  animate={{ scale: 1, color: "#1e293b" }}
                                  className="font-bold w-12 text-right"
                                >
                                  {percentage}%
                                </motion.span>
                              </div>
                            </div>
                            <div className="h-3 bg-brand-light-mauve rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: CHART_COLORS[oIndex % CHART_COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-4">
                    {question.options.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        <span className="text-xs text-brand-dark-grey truncate max-w-[100px]">
                          {opt.option_text}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Overall Summary */}
      {questions.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-brand-indigo to-brand-purple rounded-xl shadow">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Response Summary</CardTitle>
                  <CardDescription>
                    Overview of all questions in this poll
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={questions.map((q, idx) => ({
                      name: `Q${idx + 1}`,
                      fullName: q.question_text,
                      responses: q.options.reduce((acc, opt) => acc + opt.vote_count, 0),
                      options: q.options.length,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-brand-light-grey rounded-lg shadow-lg p-3 max-w-xs">
                              <p className="font-medium text-brand-black mb-1">{data.fullName}</p>
                              <p className="text-sm text-brand-mid-grey">
                                {data.responses} responses
                              </p>
                              <p className="text-sm text-brand-mid-grey">
                                {data.options} options
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="responses"
                      radius={[8, 8, 0, 0]}
                      fill="url(#barGradient)"
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6144DD" />
                        <stop offset="100%" stopColor="#FB654D" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-brand-dark-grey to-brand-black rounded-xl shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Detailed Breakdown</CardTitle>
                <CardDescription>
                  Complete data for all questions and options
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-brand-dark-grey">Question</th>
                    <th className="text-left py-3 px-4 font-semibold text-brand-dark-grey">Option</th>
                    <th className="text-right py-3 px-4 font-semibold text-brand-dark-grey">Votes</th>
                    <th className="text-right py-3 px-4 font-semibold text-brand-dark-grey">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, qIdx) => {
                    const questionTotal = question.options.reduce(
                      (acc, opt) => acc + opt.vote_count,
                      0
                    );
                    return [...question.options]
                      .sort((a, b) => b.vote_count - a.vote_count)
                      .map((option, oIdx) => (
                        <tr
                          key={option.id}
                          className="hover:bg-brand-alabaster transition-colors"
                        >
                          {oIdx === 0 && (
                            <td
                              rowSpan={question.options.length}
                              className="py-3 px-4 align-top"
                            >
                              <div className="flex items-start gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-brand-light-orange text-brand-coral rounded text-xs font-bold">
                                  Q{qIdx + 1}
                                </span>
                                <span className="text-brand-dark-grey font-medium">
                                  {question.question_text}
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="py-3 px-4 text-brand-dark-grey">{option.option_text}</td>
                          <td className="py-3 px-4 text-right font-medium text-brand-black">
                            {option.vote_count}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                oIdx === 0
                                  ? "bg-brand-light-emerald text-brand-bright-emerald"
                                  : "bg-brand-light-mauve text-brand-dark-grey"
                              }`}
                            >
                              {questionTotal > 0
                                ? Math.round((option.vote_count / questionTotal) * 100)
                                : 0}
                              %
                            </span>
                          </td>
                        </tr>
                      ));
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
