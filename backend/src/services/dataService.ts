import { supabase } from '@/config/supabase';
import { createError } from '@/middleware/errorHandler';
import { DataEntry, CreateDataRequest, UpdateDataRequest, PaginationQuery } from '@/types/api';

export class DataService {
  async getData(
    userId: string,
    query: PaginationQuery
  ): Promise<{ data: DataEntry[]; pagination: any }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';

    let queryBuilder = supabase
      .from('messages') // Using messages table as example data
      .select('*', { count: 'exact' })
      .eq('sender_id', userId);

    // Add search filter
    if (query.search) {
      queryBuilder = queryBuilder.ilike('content', `%${query.search}%`);
    }

    // Add sorting
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

    // Add pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw createError('Failed to fetch data', 500, 'FETCH_FAILED', error);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data.map(item => ({
        id: item.id,
        title: `Message ${item.id.slice(0, 8)}`,
        content: item.content,
        type: item.message_type,
        metadata: item.metadata,
        userId: item.sender_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    };
  }

  async createData(userId: string, createData: CreateDataRequest): Promise<DataEntry> {
    // For this example, we'll create a message entry
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: userId,
        conversation_id: '00000000-0000-0000-0000-000000000000', // Default conversation
        content: createData.content,
        message_type: createData.type as any,
        metadata: {
          title: createData.title,
          ...createData.metadata
        }
      })
      .select()
      .single();

    if (error || !data) {
      throw createError('Failed to create data entry', 500, 'CREATE_FAILED', error);
    }

    return {
      id: data.id,
      title: createData.title,
      content: data.content,
      type: data.message_type,
      metadata: data.metadata,
      userId: data.sender_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async updateData(
    userId: string,
    dataId: string,
    updateData: UpdateDataRequest
  ): Promise<DataEntry> {
    // First check if the data belongs to the user
    const { data: existingData, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', dataId)
      .eq('sender_id', userId)
      .single();

    if (fetchError || !existingData) {
      throw createError('Data entry not found', 404, 'DATA_NOT_FOUND');
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    if (updateData.content !== undefined) updatePayload.content = updateData.content;
    if (updateData.type !== undefined) updatePayload.message_type = updateData.type;
    if (updateData.metadata !== undefined || updateData.title !== undefined) {
      updatePayload.metadata = {
        ...existingData.metadata,
        ...(updateData.title && { title: updateData.title }),
        ...updateData.metadata
      };
    }

    const { data, error } = await supabase
      .from('messages')
      .update(updatePayload)
      .eq('id', dataId)
      .eq('sender_id', userId)
      .select()
      .single();

    if (error || !data) {
      throw createError('Failed to update data entry', 500, 'UPDATE_FAILED', error);
    }

    return {
      id: data.id,
      title: data.metadata?.title || `Message ${data.id.slice(0, 8)}`,
      content: data.content,
      type: data.message_type,
      metadata: data.metadata,
      userId: data.sender_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async deleteData(userId: string, dataId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', dataId)
      .eq('sender_id', userId);

    if (error) {
      throw createError('Failed to delete data entry', 500, 'DELETE_FAILED', error);
    }
  }

  async getDataById(userId: string, dataId: string): Promise<DataEntry> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', dataId)
      .eq('sender_id', userId)
      .single();

    if (error || !data) {
      throw createError('Data entry not found', 404, 'DATA_NOT_FOUND');
    }

    return {
      id: data.id,
      title: data.metadata?.title || `Message ${data.id.slice(0, 8)}`,
      content: data.content,
      type: data.message_type,
      metadata: data.metadata,
      userId: data.sender_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}