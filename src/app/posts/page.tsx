"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Company, Post } from "@/types/base-types";

export default function PostsPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data: posts, isLoading: isPostsLoading } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: companies, isLoading: isCompaniesLoading } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });

  const isLoading = isPostsLoading || isCompaniesLoading;

  const uniqueDates = Array.from(new Set(posts?.map((p) => p.dateTime) || [])).sort((a, b) => b.localeCompare(a));

  const filteredPosts = posts?.filter((post) => {
    const matchCompany = selectedCompany ? post.resourceUid === selectedCompany : true;
    const matchDate = selectedDate ? post.dateTime === selectedDate : true;
    return matchCompany && matchDate;
  });

  if (isLoading) return <div className="p-8 text-foreground">Loading posts...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Posts</h1>
        <p className="text-gray-400 mt-2">View and filter carbon emission reports</p>
      </div>

      {/* Filters */}
      <div className="bg-surface p-6 rounded-xl border border-border flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-2">Company</label>
          <select
            className="w-full bg-[#1c241f] border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">All Companies</option>
            {companies?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-400 mb-2">Date (Year-Month)</label>
          <select
            className="w-full bg-[#1c241f] border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">All Dates</option>
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {filteredPosts?.length === 0 ? (
          <div className="text-gray-400 text-center py-12 bg-surface rounded-xl border border-border">
            No posts found for the selected filters.
          </div>
        ) : (
          filteredPosts?.map((post) => {
            const company = companies?.find((c) => c.id === post.resourceUid);
            return (
              <div key={post.id} className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-primary">{post.title}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                      <span className="bg-[#1c241f] px-2 py-1 rounded text-primary">
                        {company?.name || post.resourceUid}
                      </span>
                      <span>{post.dateTime}</span>
                    </div>
                  </div>
                </div>
                <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {post.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
