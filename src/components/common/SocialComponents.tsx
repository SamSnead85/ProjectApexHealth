import { ReactNode, useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, UserPlus, UserMinus, Users, MapPin, Link2, Calendar, AtSign, Hash, Image, ThumbsUp, Eye, Send, Flag, Repeat2 } from 'lucide-react'
import './SocialComponents.css'

// User Profile Card
interface UserProfile { id: string; name: string; username: string; avatar?: string; bio?: string; location?: string; website?: string; joinedAt?: Date; followers: number; following: number; isFollowing?: boolean; isVerified?: boolean }

interface UserProfileCardProps { user: UserProfile; onFollow?: () => void; onMessage?: () => void; variant?: 'compact' | 'full'; className?: string }

export function UserProfileCard({ user, onFollow, onMessage, variant = 'full', className = '' }: UserProfileCardProps) {
    return (
        <div className={`user-profile-card user-profile-card--${variant} ${className}`}>
            <div className="user-profile-card__header">
                <div className="user-profile-card__avatar">
                    {user.avatar ? <img src={user.avatar} alt="" /> : user.name.charAt(0)}
                    {user.isVerified && <span className="user-profile-card__verified">✓</span>}
                </div>
                <div className="user-profile-card__info">
                    <span className="user-profile-card__name">{user.name}</span>
                    <span className="user-profile-card__username">@{user.username}</span>
                </div>
                {onFollow && (
                    <button className={`user-profile-card__follow ${user.isFollowing ? 'following' : ''}`} onClick={onFollow}>
                        {user.isFollowing ? <><UserMinus size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                    </button>
                )}
            </div>
            {variant === 'full' && (
                <>
                    {user.bio && <p className="user-profile-card__bio">{user.bio}</p>}
                    <div className="user-profile-card__meta">
                        {user.location && <span><MapPin size={12} /> {user.location}</span>}
                        {user.website && <span><Link2 size={12} /> {user.website}</span>}
                        {user.joinedAt && <span><Calendar size={12} /> Joined {user.joinedAt.toLocaleDateString()}</span>}
                    </div>
                    <div className="user-profile-card__stats">
                        <span><strong>{user.followers.toLocaleString()}</strong> Followers</span>
                        <span><strong>{user.following.toLocaleString()}</strong> Following</span>
                    </div>
                    {onMessage && <button className="user-profile-card__message" onClick={onMessage}><MessageCircle size={14} /> Message</button>}
                </>
            )}
        </div>
    )
}

// Social Post
interface PostMedia { type: 'image' | 'video'; url: string }
interface Post { id: string; author: { name: string; username: string; avatar?: string; isVerified?: boolean }; content: string; media?: PostMedia[]; likes: number; comments: number; shares: number; timestamp: Date; isLiked?: boolean; isBookmarked?: boolean }

interface SocialPostProps { post: Post; onLike?: () => void; onComment?: () => void; onShare?: () => void; onBookmark?: () => void; onMore?: () => void; className?: string }

export function SocialPost({ post, onLike, onComment, onShare, onBookmark, onMore, className = '' }: SocialPostProps) {
    const timeAgo = useMemo(() => {
        const diff = Date.now() - post.timestamp.getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 60) return `${mins}m`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours}h`
        return `${Math.floor(hours / 24)}d`
    }, [post.timestamp])

    return (
        <div className={`social-post ${className}`}>
            <div className="social-post__avatar">
                {post.author.avatar ? <img src={post.author.avatar} alt="" /> : post.author.name.charAt(0)}
            </div>
            <div className="social-post__content">
                <div className="social-post__header">
                    <span className="social-post__name">{post.author.name}</span>
                    {post.author.isVerified && <span className="social-post__verified">✓</span>}
                    <span className="social-post__username">@{post.author.username}</span>
                    <span className="social-post__time">• {timeAgo}</span>
                    <button className="social-post__more" onClick={onMore}><MoreHorizontal size={16} /></button>
                </div>
                <p className="social-post__text">{post.content}</p>
                {post.media && post.media.length > 0 && (
                    <div className={`social-post__media social-post__media--${post.media.length}`}>
                        {post.media.map((m, i) => (
                            <div key={i} className="social-post__media-item">
                                {m.type === 'image' ? <img src={m.url} alt="" /> : <video src={m.url} controls />}
                            </div>
                        ))}
                    </div>
                )}
                <div className="social-post__actions">
                    <button className={post.isLiked ? 'liked' : ''} onClick={onLike}><Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} /> {post.likes}</button>
                    <button onClick={onComment}><MessageCircle size={16} /> {post.comments}</button>
                    <button onClick={onShare}><Repeat2 size={16} /> {post.shares}</button>
                    <button className={post.isBookmarked ? 'bookmarked' : ''} onClick={onBookmark}><Bookmark size={16} fill={post.isBookmarked ? 'currentColor' : 'none'} /></button>
                </div>
            </div>
        </div>
    )
}

// Comment Component
interface Comment { id: string; author: { name: string; avatar?: string }; content: string; timestamp: Date; likes: number; isLiked?: boolean; replies?: Comment[] }

interface CommentItemProps { comment: Comment; onLike?: () => void; onReply?: () => void; className?: string }

export function CommentItem({ comment, onLike, onReply, className = '' }: CommentItemProps) {
    const [showReplies, setShowReplies] = useState(false)

    return (
        <div className={`comment-item ${className}`}>
            <div className="comment-item__avatar">{comment.author.avatar ? <img src={comment.author.avatar} alt="" /> : comment.author.name.charAt(0)}</div>
            <div className="comment-item__content">
                <div className="comment-item__header">
                    <span className="comment-item__author">{comment.author.name}</span>
                    <span className="comment-item__time">{comment.timestamp.toLocaleDateString()}</span>
                </div>
                <p className="comment-item__text">{comment.content}</p>
                <div className="comment-item__actions">
                    <button className={comment.isLiked ? 'liked' : ''} onClick={onLike}><ThumbsUp size={12} /> {comment.likes}</button>
                    <button onClick={onReply}>Reply</button>
                    {comment.replies && comment.replies.length > 0 && (
                        <button onClick={() => setShowReplies(!showReplies)}>{comment.replies.length} replies</button>
                    )}
                </div>
                {showReplies && comment.replies && (
                    <div className="comment-item__replies">
                        {comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} />)}
                    </div>
                )}
            </div>
        </div>
    )
}

// Follower Suggestion
interface FollowerSuggestionProps { users: UserProfile[]; onFollow?: (id: string) => void; onDismiss?: (id: string) => void; title?: string; className?: string }

export function FollowerSuggestions({ users, onFollow, onDismiss, title = 'Who to follow', className = '' }: FollowerSuggestionProps) {
    return (
        <div className={`follower-suggestions ${className}`}>
            <h4 className="follower-suggestions__title">{title}</h4>
            <div className="follower-suggestions__list">
                {users.map(user => (
                    <div key={user.id} className="follower-suggestions__item">
                        <div className="follower-suggestions__avatar">{user.avatar ? <img src={user.avatar} alt="" /> : user.name.charAt(0)}</div>
                        <div className="follower-suggestions__info">
                            <span className="follower-suggestions__name">{user.name}</span>
                            <span className="follower-suggestions__username">@{user.username}</span>
                        </div>
                        <button className="follower-suggestions__follow" onClick={() => onFollow?.(user.id)}><UserPlus size={14} /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Trending Topics
interface TrendingTopic { id: string; name: string; category?: string; postCount: number }

interface TrendingTopicsProps { topics: TrendingTopic[]; onSelect?: (topic: TrendingTopic) => void; title?: string; className?: string }

export function TrendingTopics({ topics, onSelect, title = 'Trending', className = '' }: TrendingTopicsProps) {
    return (
        <div className={`trending-topics ${className}`}>
            <h4 className="trending-topics__title">{title}</h4>
            <div className="trending-topics__list">
                {topics.map((topic, i) => (
                    <div key={topic.id} className="trending-topics__item" onClick={() => onSelect?.(topic)}>
                        <span className="trending-topics__rank">{i + 1}</span>
                        <div className="trending-topics__info">
                            {topic.category && <span className="trending-topics__category">{topic.category}</span>}
                            <span className="trending-topics__name"><Hash size={12} />{topic.name}</span>
                            <span className="trending-topics__count">{topic.postCount.toLocaleString()} posts</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Activity Feed Item
interface ActivityItem { id: string; type: 'like' | 'comment' | 'follow' | 'mention' | 'share'; user: { name: string; avatar?: string }; target?: string; timestamp: Date }

interface ActivityFeedProps { activities: ActivityItem[]; className?: string }

export function ActivityFeed({ activities, className = '' }: ActivityFeedProps) {
    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'like': return <Heart size={14} />
            case 'comment': return <MessageCircle size={14} />
            case 'follow': return <UserPlus size={14} />
            case 'mention': return <AtSign size={14} />
            case 'share': return <Share2 size={14} />
        }
    }

    const getMessage = (item: ActivityItem) => {
        switch (item.type) {
            case 'like': return 'liked your post'
            case 'comment': return 'commented on your post'
            case 'follow': return 'started following you'
            case 'mention': return 'mentioned you'
            case 'share': return 'shared your post'
        }
    }

    return (
        <div className={`activity-feed ${className}`}>
            {activities.map(item => (
                <div key={item.id} className={`activity-feed__item activity-feed__item--${item.type}`}>
                    <div className="activity-feed__icon">{getIcon(item.type)}</div>
                    <div className="activity-feed__avatar">{item.user.avatar ? <img src={item.user.avatar} alt="" /> : item.user.name.charAt(0)}</div>
                    <div className="activity-feed__content">
                        <span><strong>{item.user.name}</strong> {getMessage(item)}</span>
                        <span className="activity-feed__time">{item.timestamp.toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default { UserProfileCard, SocialPost, CommentItem, FollowerSuggestions, TrendingTopics, ActivityFeed }
