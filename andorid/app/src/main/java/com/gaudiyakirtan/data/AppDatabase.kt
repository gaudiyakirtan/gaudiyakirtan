package com.gaudiyakirtan.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.gaudiyakirtan.data.dao.AuthorDao
import com.gaudiyakirtan.data.dao.BookDao
import com.gaudiyakirtan.data.dao.SongDao
import com.gaudiyakirtan.data.dao.TopicDao
import com.gaudiyakirtan.data.entities.AuthorEntity
import com.gaudiyakirtan.data.entities.BookEntity
import com.gaudiyakirtan.data.entities.SongEntity
import com.gaudiyakirtan.data.entities.TopicEntity

@Database(
    entities = [SongEntity::class, AuthorEntity::class, TopicEntity::class, BookEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun songDao(): SongDao
    abstract fun authorDao(): AuthorDao
    abstract fun topicDao(): TopicDao
    abstract fun bookDao(): BookDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "gaudiyakirtan.db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
