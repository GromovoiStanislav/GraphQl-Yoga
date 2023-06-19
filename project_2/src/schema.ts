//import { makeExecutableSchema } from '@graphql-tools/schema'
import {createSchema} from "graphql-yoga";
import type {GraphQLContext} from './context.js'
import type {Link, Comment} from '@prisma/client'


const typeDefs = `
      type Link {
        id: ID!
        description: String!
        url: String!
        comments: [Comment!]!
      }
      
      type Comment {
          id: ID!
          body: String!
          link: Link
      }
      
      type Query {
        hello: String!
        links: [Link!]!
        link(id: ID): Link
        comments: [Comment!]!
        comment(id: ID!): Comment
      }
      
      type Mutation {
        postLink(url: String!, description: String!): Link
        postCommentOnLink(linkId: ID!, body: String!): Comment!
      }
      
    `


const resolvers = {
    Query: {
        hello: () => 'Hello from Yoga!',

        async links(parent: unknown, args: {}, context: GraphQLContext) {
            return context.prisma.link.findMany();
        },

        async link(parent: unknown, args: { id: string }, context: GraphQLContext) {
            return context.prisma.link.findUnique({
                where: {id: parseInt(args.id)}
            })
        },

        async comments(parent: unknown, args: {}, context: GraphQLContext) {
            return context.prisma.comment.findMany();
        },

        async comment(parent: unknown, args: { id: string }, context: GraphQLContext) {
            return context.prisma.comment.findUnique({
                where: {id: parseInt(args.id)}
            })
        }
    },

    Link: {
        id: (parent: Link) => parent.id,
        description: (parent: Link) => parent.description,
        url: (parent: Link) => parent.url,
        comments: async (parent: Link, args: {}, context: GraphQLContext) => {
            return context.prisma.comment.findMany({
                where: {
                    linkId: parent.id
                }
            })
        },
    },
    Comment: {
        id: (parent: Comment) => parent.id,
        body: (parent: Comment) => parent.body,
        link: async (parent: Comment, args: {}, context: GraphQLContext) => {
            return context.prisma.link.findUnique({
                where: {
                    id: parent.linkId
                }
            })
        },
    },


    Mutation: {
        async postLink(
            parent: unknown,
            args: { description: string; url: string },
            context: GraphQLContext
        ) {
            const newLink = await context.prisma.link.create({
                data: {
                    url: args.url,
                    description: args.description
                }
            })
            return newLink
        },

        async postCommentOnLink(
            parent: unknown,
            args: { linkId: string; body: string },
            context: GraphQLContext
        ) {
            const newComment = await context.prisma.comment.create({
                data: {
                    linkId: parseInt(args.linkId),
                    body: args.body
                }
            })
            return newComment
        }
    }
}

// export const schema = makeExecutableSchema({
//     resolvers: [resolvers],
//     typeDefs: [typeDefinitions]
// })

export const schema = createSchema({typeDefs, resolvers})