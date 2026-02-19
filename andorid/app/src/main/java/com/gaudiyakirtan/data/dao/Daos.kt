package com.gaudiyakirtan.data.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.gaudiyakirtan.data.entities.AuthorEntity
import com.gaudiyakirtan.data.entities.BookEntity
import com.gaudiyakirtan.data.entities.SongEntity
import com.gaudiyakirtan.data.entities.TopicEntity

@Dao
interface SongDao {
    @Query("SELECT * FROM songs")
    suspend fun getAllSongs(): List<SongEntity>

    @Query("SELECT * FROM songs WHERE uid = :uid")
    suspend fun getSongByUid(uid: String): SongEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(songs: List<SongEntity>)

    @Query("SELECT COUNT(*) FROM songs")
    suspend fun count(): Int
}

@Dao
interface AuthorDao {
    @Query("SELECT * FROM authors")
    suspend fun getAllAuthors(): List<AuthorEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(authors: List<AuthorEntity>)
}

@Dao
interface TopicDao {
    @Query("SELECT * FROM topics")
    suspend fun getAllTopics(): List<TopicEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(topics: List<TopicEntity>)
}

@Dao
interface BookDao {
    @Query("SELECT * FROM books")
    suspend fun getAllBooks(): List<BookEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(books: List<BookEntity>)
}
